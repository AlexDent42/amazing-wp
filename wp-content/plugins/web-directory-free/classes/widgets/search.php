<?php

global $w2dc_search_widget_params;
$w2dc_search_widget_params = array(
		array(
				'type' => 'dropdown',
				'param_name' => 'custom_home',
				'value' => array(__('No', 'W2DC') => '0', __('Yes', 'W2DC') => '1'),
				'heading' => __('Is it on custom home page?', 'W2DC'),
				//'description' => __('When set to Yes - the widget will follow some parameters from Directory Settings and not those listed here.', 'W2DC'),
		),
		array(
				'type' => 'directory',
				'param_name' => 'directory',
				'heading' => __("Search by directory", "W2DC"),
				'dependency' => array('element' => 'custom_home', 'value' => '0'),
		),
		array(
				'type' => 'textfield',
				'param_name' => 'uid',
				'heading' => __("uID", "W2DC"),
				'description' => __("Enter unique string to connect search form with another elements on the page.", "W2DC"),
				'dependency' => array('element' => 'custom_home', 'value' => '0'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'columns',
				'value' => array('2', '1'),
				'std' => '2',
				'heading' => __('Number of columns to arrange search fields', 'W2DC'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'advanced_open',
				'value' => array(__('No', 'W2DC') => '0', __('Yes', 'W2DC') => '1'),
				'heading' => __('Advanced search panel always open', 'W2DC'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'sticky_scroll',
				'value' => array(__('No', 'W2DC') => '0', __('Yes', 'W2DC') => '1'),
				'heading' => __('Make search form to be sticky on scroll', 'W2DC'),
		),
		array(
				'type' => 'textfield',
				'param_name' => 'sticky_scroll_toppadding',
				'value' => 0,
				'heading' => __('Sticky scroll top padding', 'W2DC'),
				'description' => __('Sticky scroll top padding in pixels.', 'W2DC'),
				'dependency' => array('element' => 'sticky_scroll', 'value' => '1'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'show_keywords_search',
				'value' => array(__('Yes', 'W2DC') => '1', __('No', 'W2DC') => '0'),
				'heading' => __('Show keywords search?', 'W2DC'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'keywords_ajax_search',
				'value' => array(__('Yes', 'W2DC') => '1', __('No', 'W2DC') => '0'),
				'heading' => __('Enable listings autosuggestions by keywords', 'W2DC'),
		),
		array(
				'type' => 'textfield',
				'param_name' => 'keywords_search_examples',
				'heading' => __('Keywords examples', 'W2DC'),
				'description' => __('Comma-separated list of suggestions to try to search.', 'W2DC'),
		),
		/* array(
				'type' => 'textfield',
				'param_name' => 'what_search',
				'heading' => __('Default keywords', 'W2DC'),
		), */
		array(
				'type' => 'textfield',
				'param_name' => 'keywords_placeholder',
				'heading' => __('Keywords placeholder', 'W2DC'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'show_categories_search',
				'value' => array(__('Yes', 'W2DC') => '1', __('No', 'W2DC') => '0'),
				'heading' => __('Show categories search?', 'W2DC'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'categories_search_level',
				'value' => array('1', '2', '3'),
				'std' => '2',
				'heading' => __('Categories search depth level', 'W2DC'),
		),
		array(
				'type' => 'categoryfield',
				'param_name' => 'category',
				'heading' => __('Select certain category', 'W2DC'),
		),
		array(
				'type' => 'categoriesfield',
				'param_name' => 'exact_categories',
				'heading' => __('List of categories', 'W2DC'),
				'description' => __('Comma separated string of categories slugs or IDs. Possible to display exact categories.', 'W2DC'),
				'dependency' => array('element' => 'custom_home', 'value' => '0'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'show_locations_search',
				'value' => array(__('Yes', 'W2DC') => '1', __('No', 'W2DC') => '0'),
				'heading' => __('Show locations search?', 'W2DC'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'locations_search_level',
				'value' => array('1', '2', '3'),
				'std' => '2',
				'heading' => __('Locations search depth level', 'W2DC'),
		),
		array(
				'type' => 'locationfield',
				'param_name' => 'location',
				'heading' => __('Select certain location', 'W2DC'),
		),
		array(
				'type' => 'locationsfield',
				'param_name' => 'exact_locations',
				'heading' => __('List of locations', 'W2DC'),
				'description' => __('Comma separated string of locations slugs or IDs. Possible to display exact locations.', 'W2DC'),
				'dependency' => array('element' => 'custom_home', 'value' => '0'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'show_address_search',
				'value' => array(__('Yes', 'W2DC') => '1', __('No', 'W2DC') => '0'),
				'heading' => __('Show address search?', 'W2DC'),
		),
		array(
				'type' => 'textfield',
				'param_name' => 'address',
				'heading' => __('Default address', 'W2DC'),
		),
		array(
				'type' => 'textfield',
				'param_name' => 'address_placeholder',
				'heading' => __('Adress placeholder', 'W2DC'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'show_radius_search',
				'value' => array(__('Yes', 'W2DC') => '1', __('No', 'W2DC') => '0'),
				'heading' => __('Show locations radius search?', 'W2DC'),
		),
		array(
				'type' => 'textfield',
				'param_name' => 'radius',
				'heading' => __('Default radius search', 'W2DC'),
		),
		array(
				'type' => 'contentfields',
				'param_name' => 'search_fields',
				'heading' => __('Select certain content fields', 'W2DC'),
		),
		array(
				'type' => 'contentfields',
				'param_name' => 'search_fields_advanced',
				'heading' => __('Select certain content fields in advanced section', 'W2DC'),
		),
		array(
				'type' => 'colorpicker',
				'param_name' => 'search_bg_color',
				'heading' => __("Background color", "W2DC"),
				'value' => get_option('w2dc_search_bg_color'),
		),
		array(
				'type' => 'colorpicker',
				'param_name' => 'search_text_color',
				'heading' => __("Text color", "W2DC"),
				'value' => get_option('w2dc_search_text_color'),
		),
		array(
				'type' => 'textfield',
				'param_name' => 'search_bg_opacity',
				'heading' => __("Opacity of search form background, in %", "W2DC"),
				'value' => 100,
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'search_overlay',
				'value' => array(__('Yes', 'W2DC') => '1', __('No', 'W2DC') => '0'),
				'heading' => __('Show background overlay', 'W2DC'),
				'std' => get_option('w2dc_search_overlay')
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'hide_search_button',
				'value' => array(__('No', 'W2DC') => '0', __('Yes', 'W2DC') => '1'),
				'heading' => __('Hide search button', 'W2DC'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'on_row_search_button',
				'value' => array(__('No', 'W2DC') => '0', __('Yes', 'W2DC') => '1'),
				'heading' => __('Search button on one line with fields', 'W2DC'),
		),
		array(
				'type' => 'dropdown',
				'param_name' => 'scroll_to',
				'value' => array(__('No scroll', 'W2DC') => '', __('Listings', 'W2DC') => 'listings', __('Map', 'W2DC') => 'map'),
				'heading' => __('Scroll to listings, map or do not scroll after search button was pressed', 'W2DC'),
		),
		array(
				'type' => 'checkbox',
				'param_name' => 'search_visibility',
				'heading' => __("Show only when there is no any other search form on page", "W2DC"),
		),
		array(
				'type' => 'checkbox',
				'param_name' => 'visibility',
				'heading' => __("Show only on directory pages", "W2DC"),
				'value' => 0,
				'description' => __("Otherwise it will load plugin's files on all pages.", "W2DC"),
		),
);

class w2dc_search_widget extends w2dc_widget {

	public function __construct() {
		global $w2dc_instance, $w2dc_search_widget_params;

		parent::__construct(
				'w2dc_search_widget',
				__('Directory - Search', 'W2DC')
		);

		foreach ($w2dc_instance->search_fields->filter_fields_array AS $filter_field) {
			if (method_exists($filter_field, 'getVCParams') && ($field_params = $filter_field->getVCParams())) {
				$w2dc_search_widget_params = array_merge($w2dc_search_widget_params, $field_params);
			}
		}

		$this->convertParams($w2dc_search_widget_params);
	}
	
	public function render_widget($instance, $args) {
		global $w2dc_instance;
		
		// when visibility enabled - show only on directory pages
		if (empty($instance['visibility']) || !empty($w2dc_instance->frontend_controllers)) {
			// when search_visibility enabled - show only when main search form wasn't displayed
			if (!empty($instance['search_visibility']) && !empty($w2dc_instance->frontend_controllers)) {
				foreach ($w2dc_instance->frontend_controllers AS $shortcode_controllers) {
					foreach ($shortcode_controllers AS $controller) {
						if (is_object($controller) && $controller->search_form) {
							return false;
						}
					}
				}
			}
				
			$title = apply_filters('widget_title', $instance['title']);
				
			// it is auto selection - take current directory
			if ($instance['directory'] == 0) {
				// probably we are on single listing page - it could be found only after frontend controllers were loaded, so we have to repeat setting
				$w2dc_instance->setCurrentDirectory();
		
				$instance['directory'] = $w2dc_instance->current_directory->id;
			}

			echo $args['before_widget'];
			if (!empty($title)) {
				echo $args['before_title'] . $title . $args['after_title'];
			}
			echo '<div class="w2dc-content w2dc-widget w2dc-search-widget">';
			$controller = new w2dc_search_controller();
			$controller->init($instance);
			echo $controller->display();
			echo '</div>';
			echo $args['after_widget'];
		}
	}
}
?>