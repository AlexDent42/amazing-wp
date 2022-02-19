<?php 

/**
 *  [webdirectory-search] shortcode
 *
 *
 */
class w2dc_search_controller extends w2dc_frontend_controller {

	public function init($args = array()) {
		global $w2dc_instance;

		parent::init($args);

		$this->args = array_merge(array(
				'redirect' => '',
				'custom_home' => 0,
				'directory' => 0,
				'columns' => 2,
				'advanced_open' => false,
				'uid' => null,
				'show_categories_search' => !empty($args['custom_home']) ? (int)get_option('w2dc_show_categories_search') : 1,
				'categories_search_level' => !empty($args['custom_home']) ? (int)get_option('w2dc_categories_search_nesting_level') : 2,
				'category' => 0,
				'exact_categories' => array(),
				'show_keywords_search' => !empty($args['custom_home']) ? (int)get_option('w2dc_show_keywords_search') : 1,
				'keywords_ajax_search' => !empty($args['custom_home']) ? (int)get_option('w2dc_keywords_ajax_search') : 1,
				'keywords_search_examples' => !empty($args['custom_home']) ? get_option('w2dc_keywords_search_examples') : '',
				'what_search' => '',
				'keywords_placeholder' => '',
				'show_radius_search' => !empty($args['custom_home']) ? (int)get_option('w2dc_show_radius_search') : 1,
				'radius' => !empty($args['custom_home']) ? (int)get_option('w2dc_radius_search_default') : 0,
				'show_locations_search' => !empty($args['custom_home']) ? (int)get_option('w2dc_show_locations_search') : 1,
				'locations_search_level' => !empty($args['custom_home']) ? (int)get_option('w2dc_locations_search_nesting_level') : 2,
				'show_address_search' => !empty($args['custom_home']) ? (int)get_option('w2dc_show_address_search') : 1,
				'address' => '',
				'address_placeholder' => '',
				'location' => 0,
				'exact_locations' => array(),
				'search_fields' => '',
				'search_fields_advanced' => '',
				'search_bg_color' => '',
				'search_bg_opacity' => 100,
				'search_text_color' => '',
				'search_overlay' => !empty($args['custom_home']) ? (int)get_option('w2dc_search_overlay') : 1,
				'hide_search_button' => 0,
				'on_row_search_button' => 0,
				'sticky_scroll' => 0,
				'sticky_scroll_toppadding' => 0,
				'scroll_to' => 'listings', // '', 'listings', 'map'
		), $args);

		$hash = false;
		if (!$this->args['custom_home'] && $this->args['uid']) {
			$hash = md5($this->args['uid']);
		}

		$this->search_form = new w2dc_search_form($hash, 'listings_controller', $this->args);
		
		apply_filters('w2dc_search_controller_construct', $this);
	}

	public function display() {
		ob_start();
		$this->search_form->display($this->args['columns'], $this->args['advanced_open']);
		$output = ob_get_clean();

		return $output;
	}
}

?>