<?php 

class w2dc_content_field_datetime_search extends w2dc_content_field_search {
	public $min_max_value;
	
	public function isParamOfThisField($param) {
		if ($param == 'field_' . $this->content_field->slug . '_min' || $param == 'field_' . $this->content_field->slug . '_max') {
			return true;
		}
	}

	public function renderSearch($search_form_id, $columns = 2, $defaults = array()) {

		if (is_null($this->min_max_value)) {
			if (isset($defaults['field_' . $this->content_field->slug . '_min'])) {
				$val = $defaults['field_' . $this->content_field->slug . '_min'];
				if (!is_numeric($val)) {
					$val = strtotime($val);
				}
				$this->min_max_value['min'] = $val;
			} else {
				$this->min_max_value['min'] = '';
			}
			if (isset($defaults['field_' . $this->content_field->slug . '_max'])) {
				$val = $defaults['field_' . $this->content_field->slug . '_max'];
				if (!is_numeric($val)) {
					$val = strtotime($val);
				}
				$this->min_max_value['max'] = $val;
			} else {
				$this->min_max_value['max'] = '';
			}
		}
		
		if ($this->min_max_value['min'] && !is_numeric($this->min_max_value['min'])) {
			$this->min_max_value['min'] = strtotime($this->min_max_value['min']);
		}
		if ($this->min_max_value['max'] && !is_numeric($this->min_max_value['max'])) {
			$this->min_max_value['max'] = strtotime($this->min_max_value['max']);
		}

		w2dc_renderTemplate('search_fields/fields/datetime_input.tpl.php', array('search_field' => $this, 'columns' => $columns, 'dateformat' => w2dc_getDatePickerFormat(), 'search_form_id' => $search_form_id));
	}
	
	public function loadValue($defaults = array(), $include_GET_params = true) {
		$field_index = 'field_' . $this->content_field->slug . '_min';
		if ($include_GET_params) {
			$this->min_max_value['min'] = ((w2dc_getValue($_REQUEST, $field_index, false) !== false) ? w2dc_getValue($_REQUEST, $field_index) : w2dc_getValue($defaults, $field_index));
		} else {
			$this->min_max_value['min'] = w2dc_getValue($defaults, $field_index, false);
		}
	
		$field_index = 'field_' . $this->content_field->slug . '_max';
		if ($include_GET_params) {
			$this->min_max_value['max'] = ((w2dc_getValue($_REQUEST, $field_index, false) !== false) ? w2dc_getValue($_REQUEST, $field_index) : w2dc_getValue($defaults, $field_index));
		} else {
			$this->min_max_value['max'] = w2dc_getValue($defaults, $field_index, false);
		}
	
		$this->value_loaded = true;
	}
	
	public function validateSearch(&$args, $defaults = array(), $include_GET_params = true) {
		global $wpdb;
		
		if (!$this->value_loaded) {
			$this->loadValue($defaults, $include_GET_params);
		}

		$wheres = array();
		if ($this->min_max_value['min'] !== false && ((is_numeric($this->min_max_value['min']) && $this->min_max_value['min'] > 0) || strtotime($this->min_max_value['min']))) {
			$value = $this->min_max_value['min'];
			if (!is_numeric($value)) {
				$value = strtotime($this->min_max_value['min']);
			}
			$wheres[] = "(meta1.meta_key = '_content_field_" . $this->content_field->id . "_date_end' AND CAST(meta1.meta_value AS SIGNED) >= " . $value . ")";
		}
		if ($this->min_max_value['max'] !== false && ((is_numeric($this->min_max_value['max']) && $this->min_max_value['max'] > 0) || strtotime($this->min_max_value['max']))) {
			$value = $this->min_max_value['max'];
			if (!is_numeric($value)) {
				$value = strtotime($this->min_max_value['max']);
			}
			$wheres[] = "(meta2.meta_key = '_content_field_" . $this->content_field->id . "_date_start' AND CAST(meta2.meta_value AS SIGNED) <= " . $value . ")";
		}

		if ($wheres) {
			$query = "SELECT meta1.post_id FROM {$wpdb->postmeta} AS meta1 INNER JOIN {$wpdb->postmeta} AS meta2 ON meta1.post_id = meta2.post_id WHERE (" . implode(" AND ", $wheres) . ")";

			$posts_in = array();
			$results = $wpdb->get_results($query, ARRAY_A);
			foreach ($results AS $row) {
				$posts_in[] = $row['post_id'];
			}
			if ($posts_in) {
				$posts_in = array_unique($posts_in);
				
				if (!empty($args['post__in'])) {
					$args['post__in'] = array_intersect($args['post__in'], $posts_in);
				} else {
					$args['post__in'] = $posts_in;
				}
			} else {
				$args['post__in'] = array(0);
			}
		}
	}
	
	public function getBaseUrlArgs(&$args) {
		$field_index = 'field_' . $this->content_field->slug . '_min';
		if (isset($_REQUEST[$field_index]) && $_REQUEST[$field_index] && is_numeric($_REQUEST[$field_index])) {
			$args[$field_index] = $_REQUEST[$field_index];
		}
	
		$field_index = 'field_' . $this->content_field->slug . '_max';
		if (isset($_REQUEST[$field_index]) && $_REQUEST[$field_index] && is_numeric($_REQUEST[$field_index])) {
			$args[$field_index] = $_REQUEST[$field_index];
		}
	}
	
	public function getVCParams() {
		return array(
				array(
					'type' => 'datefieldmin',
					'param_name' => 'field_' . $this->content_field->slug . '_min',
					'heading' => __('From ', 'W2DC') . $this->content_field->name,
					'field_id' => $this->content_field->id,
				),
				array(
					'type' => 'datefieldmax',
					'param_name' => 'field_' . $this->content_field->slug . '_max',
					'heading' => __('To ', 'W2DC') . $this->content_field->name,
					'field_id' => $this->content_field->id,
				)
			);
	}
	
	public function resetValue() {
		$this->min_max_value = array('min' => '', 'max' => '');
	}
	
	public function printVisibleSearchParams($frontend_controller) {
		$field_index = 'field_' . $this->content_field->slug . '_min';
		if (isset($_REQUEST[$field_index]) && $_REQUEST[$field_index] && is_numeric($_REQUEST[$field_index])) {
			$url = remove_query_arg($field_index, $frontend_controller->base_url);
			$tmstmp = $_REQUEST[$field_index];
			echo w2dc_visibleSearchParam(sprintf(__("%s from %s", "W2DC"), $this->content_field->name, date(get_option('date_format'), $tmstmp)), $url);
		}
		
		$field_index = 'field_' . $this->content_field->slug . '_max';
		if (isset($_REQUEST[$field_index]) && $_REQUEST[$field_index] && is_numeric($_REQUEST[$field_index])) {
			$url = remove_query_arg($field_index, $frontend_controller->base_url);
			$tmstmp = $_REQUEST[$field_index];
			echo w2dc_visibleSearchParam(sprintf(__("%s to %s", "W2DC"), $this->content_field->name, date(get_option('date_format'), $tmstmp)), $url);
		}
	}
}

add_action('vc_before_init', 'w2dc_vc_init_datefield');
function w2dc_vc_init_datefield() {
	vc_add_shortcode_param('datefieldmin', 'w2dc_datefieldmin_param');
	vc_add_shortcode_param('datefieldmax', 'w2dc_datefieldmax_param');

	if (!function_exists('w2dc_datefieldmin_param')) { // some "unique" themes/plugins call vc_before_init more than ones - this is such protection
		function w2dc_datefieldmin_param($settings, $value) {
			if (!is_numeric($value))
				$value = strtotime($value);
			return w2dc_renderTemplate('search_fields/fields/datetime_input_vc_min.tpl.php', array('settings' => $settings, 'value' => $value, 'dateformat' => w2dc_getDatePickerFormat()), true);
		}
	}
	if (!function_exists('w2dc_datefieldmax_param')) { // some "unique" themes/plugins call vc_before_init more than ones - this is such protection
		function w2dc_datefieldmax_param($settings, $value) {
			if (!is_numeric($value))
				$value = strtotime($value);
			return w2dc_renderTemplate('search_fields/fields/datetime_input_vc_max.tpl.php', array('settings' => $settings, 'value' => $value, 'dateformat' => w2dc_getDatePickerFormat()), true);
		}
	}
}
?>