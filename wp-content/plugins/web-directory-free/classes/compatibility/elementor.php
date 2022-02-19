<?php

add_action("w2dc_load_frontend_controllers", "w2dc_elementor_load_frontend_controllers");

function w2dc_elementor_load_frontend_controllers() {
	global $post;
	
	if (!defined('ELEMENTOR_VERSION')) {
		return;
	}

	$elementor_data = get_post_meta($post->ID, '_elementor_data' ,true);

	if (is_string($elementor_data) && !empty($elementor_data)) {
		$elementor_data = json_decode($elementor_data, true);
	}

	if ($elementor_data) {
		_w2dc_elementor_load_frontend_controllers($elementor_data);
	}
}

function _w2dc_elementor_load_frontend_controllers($elements) {
	global $w2dc_shortcodes;

	foreach ($elements AS $element) {
		if ($element['elType'] == 'widget') {
			$shortcode = false;

			switch ($element['widgetType']) {
				case 'wp-widget-w2dc_directory_shortcode_widget':
					$shortcode = W2DC_MAIN_SHORTCODE;
					break;
				case 'wp-widget-w2dc_search_widget':
					$shortcode = 'webdirectory-search';
					break;
				case 'wp-widget-w2dc_map_widget':
					$shortcode = 'webdirectory-map';
					break;
				case 'wp-widget-w2dc_listings_shortcode_widget':
					$shortcode = 'webdirectory-listings';
					break;
			}

			if ($shortcode && ($settings = $element['settings']['wp'])) {
				$shortcode_class = $w2dc_shortcodes[$shortcode];
				$shortcode_instance = new $shortcode_class();
				$shortcode_instance->init($settings, $shortcode);
				w2dc_setFrontendController($shortcode, $shortcode_instance);
			}
		} elseif (!empty($element['elements'])) {
			_w2dc_elementor_load_frontend_controllers($element['elements']);
		}
	}
}

add_action('wp_footer', 'w2dc_elementor_support_wp_footer');
function w2dc_elementor_support_wp_footer() {
	if (!defined('ELEMENTOR_VERSION')) {
		return;
	}
	?>
		<script>
			jQuery(function($) {
				if (window.elementorFrontend && typeof elementorFrontend.hooks != 'undefined') {
					elementorFrontend.hooks.addAction('frontend/element_ready/global', function(el) {
						if (el.data("widget_type") && el.data("widget_type").indexOf("w2dc_") != -1) {
							w2dc_equalColumnsHeight();
							w2dc_equalColumnsHeightEvent();
							w2dc_listings_carousel();
							w2dc_radius_slider();
							w2dc_process_main_search_fields();
							w2dc_nice_scroll();
							w2dc_custom_input_controls();
							w2dc_my_location_buttons();
							w2dc_listing_tabs();
							w2dc_sticky_scroll();
							w2dc_tooltips();
							w2dc_ratings();
							w2dc_hours_content_field();
							w2dc_full_height_maps();

							if (typeof w2dc_load_maps != 'undefined') {
								for (var i=0; i<w2dc_map_markers_attrs_array.length; i++) {
									w2dc_load_map(i);
								}
							}
						}
					});
				}
			});
		</script>
		<?php
	}

?>