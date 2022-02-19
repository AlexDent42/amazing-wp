<?php 

class w2dc_content_field_string_search extends w2dc_content_field_search {
	public $search_input_mode = 'keywords';
	
	public function searchConfigure() {
		global $wpdb, $w2dc_instance;
	
		if (w2dc_getValue($_POST, 'submit') && wp_verify_nonce($_POST['w2dc_configure_content_fields_nonce'], W2DC_PATH)) {
			$validation = new w2dc_form_validation();
			$validation->set_rules('search_input_mode', __('Search input mode', 'W2DC'), 'required');
			if ($validation->run()) {
				$result = $validation->result_array();
				if ($wpdb->update($wpdb->w2dc_content_fields, array('search_options' => serialize(array('search_input_mode' => $result['search_input_mode']))), array('id' => $this->content_field->id), null, array('%d')))
					w2dc_addMessage(__('Search field configuration was updated successfully!', 'W2DC'));
	
				$w2dc_instance->content_fields_manager->showContentFieldsTable();
			} else {
				$this->search_input_mode = $validation->result_array('search_input_mode');
				w2dc_addMessage($validation->error_array(), 'error');
	
				w2dc_renderTemplate('search_fields/fields/string_textarea_configuration.tpl.php', array('search_field' => $this));
			}
		} else
			w2dc_renderTemplate('search_fields/fields/string_textarea_configuration.tpl.php', array('search_field' => $this));
	}
	
	public function buildSearchOptions() {
		if (isset($this->content_field->search_options['search_input_mode']))
			$this->search_input_mode = $this->content_field->search_options['search_input_mode'];
	}

	public function renderSearch($search_form_id, $columns = 2, $defaults = array()) {
		if ($this->search_input_mode == 'input') {
			if (is_null($this->value) && isset($defaults['field_' . $this->content_field->slug])) {
				$this->value = $defaults['field_' . $this->content_field->slug];
			}
			
			w2dc_renderTemplate('search_fields/fields/string_textarea_input.tpl.php', array('search_field' => $this, 'columns' => $columns, 'search_form_id' => $search_form_id));
		}
	}
	
	public function loadValue($defaults = array(), $include_GET_params = true) {
		if ($this->search_input_mode == 'input') {
			$field_index = 'field_' . $this->content_field->slug;
	
			if ($include_GET_params) {
				$this->value = ((w2dc_getValue($_REQUEST, $field_index, false) !== false) ? w2dc_getValue($_REQUEST, $field_index) : w2dc_getValue($defaults, $field_index));
			} else {
				$this->value = w2dc_getValue($defaults, $field_index, false);
			}
		}
	
		$this->value_loaded = true;
	}
	
	public function validateSearch(&$args, $defaults = array(), $include_GET_params = true) {
		if (!$this->value_loaded) {
			$this->loadValue($defaults, $include_GET_params);
		}
		
		if ($this->search_input_mode == 'input') {
			if ($this->value !== false && $this->value !== "") {
				$args['meta_query']['relation'] = 'AND';
				$args['meta_query'][] = array(
						'key' => '_content_field_' . $this->content_field->id,
						'value' => stripslashes($this->value),
						'compare' => 'LIKE'
				);
			}
		} elseif ($this->search_input_mode == 'keywords' && $this->content_field->on_search_form) {
			if (!empty($args['s'])) {
				$this->value = $args['s'];

				add_filter('posts_clauses', array($this, 'postsClauses'), 11, 2);
			}
		}
	}
	
	public function postsClauses($clauses, $q) {
		global $wpdb;

		$postmeta_table = 'w2dc_postmeta_' . $this->content_field->id;
		
		if ($this->value && strpos($clauses['join'], $postmeta_table) === false) {
			$words = explode(" ", $this->value);
			$words_like = array();
			foreach ($words AS $word) {
				$words_like[] = 'meta_value LIKE "%%%s%"';
			}
			$post_ids_results = $wpdb->get_results($wpdb->prepare('SELECT post_id FROM ' . $wpdb->postmeta . ' WHERE meta_key = "_content_field_' . $this->content_field->id . '" AND (' . implode(" OR ", $words_like) . ') ', $words), ARRAY_A);

			$post_ids = array();
			foreach ($post_ids_results AS $id) {
				$post_ids[] = $id["post_id"];
			}
			if ($post_ids) {
				$clauses['where'] = preg_replace(
						"/\(\s*".$wpdb->posts.".post_title\s+LIKE\s*(\'[^\']+\')\s*\)/",
						"(".$wpdb->posts.".post_title LIKE $1) OR (".$wpdb->posts.".ID IN (" . implode(",", $post_ids) . "))", $clauses['where']);
				
				// Add GROUP BY posts.ID (for some occasions it becomes missing in the result query)
				$clauses['groupby'] = "{$wpdb->posts}.ID";
			}
		}
		
		return $clauses;
	}
	
	public function getVCParams() {
		return array(
				array(
						'type' => 'textfield',
						'param_name' => 'field_' . $this->content_field->slug,
						'heading' => $this->content_field->name,
				),
		);
	}
	
	public function printVisibleSearchParams($frontend_controller) {
		$field_index = 'field_' . $this->content_field->slug;
		if (isset($_REQUEST[$field_index]) && $_REQUEST[$field_index]) {
			$value = trim($_REQUEST[$field_index]);
			$url = remove_query_arg($field_index, $frontend_controller->base_url);
			
			$words_array = explode(" ", $value);
			if (count($words_array) > 3) {
				$words_array = array_slice($words_array, 0, 3);
				$words_array[] = "...";
			}
			
			echo w2dc_visibleSearchParam(implode(" ", $words_array), $url);
		}
	}
}
?>