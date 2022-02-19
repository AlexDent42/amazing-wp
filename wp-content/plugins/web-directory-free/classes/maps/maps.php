<?php

class w2dc_maps {
	public $args;
	public $directories;
	public $controller;
	public $map_id;
	
	public $map_zoom;
	public $listings_array = array();
	public $locations_array = array();
	public $locations_option_array = array();

	public static $map_content_fields;

	public function __construct($args = array(), $controller = 'listings_controller', $directories = null) {
		global $w2dc_instance;
		
		$this->args = $args;
		$this->controller = $controller;

		if (is_null($directories)) {
			$this->directories = array($w2dc_instance->current_directory->id);
		} elseif (!empty($directories)) {
			if ($directories_ids = array_filter(explode(',', $directories), 'trim')) {
				$this->directories = $directories_ids;
			}
		}
	}
	
	public function setUniqueId($unique_id) {
		$this->map_id = $unique_id;
	}

	public function collectLocations($listing, $show_summary_button = true, $show_readmore_button = true) {
		global $w2dc_address_locations, $w2dc_tax_terms_locations;

		if (count($listing->locations) == 1)
			$this->map_zoom = $listing->map_zoom;

		foreach ($listing->locations AS $location) {
			if ((!$w2dc_address_locations || in_array($location->id, $w2dc_address_locations)) && (!$w2dc_tax_terms_locations || in_array($location->selected_location, $w2dc_tax_terms_locations))) {
				if (($location->map_coords_1 && $location->map_coords_1 != '0.000000') || ($location->map_coords_2 && $location->map_coords_2 != '0.000000')) {
					$logo_image = '';
					if ($listing->level->logo_enabled) {
						if ($listing->logo_image) {
							$height = apply_filters('w2dc_map_infowindow_logo_height', 0);
							
							$logo_image = $listing->get_logo_url(array(get_option('w2dc_map_infowindow_logo_width'), $height));
						} elseif (get_option('w2dc_enable_nologo') && get_option('w2dc_nologo_url')) {
							$logo_image = get_option('w2dc_nologo_url');
						}
					}
	
					$listing_link = '';
					if ($listing->level->listings_own_page) {
						$listing_link = get_permalink($listing->post->ID);
					}
	
					/* if ($w2dc_instance->content_fields->getMapContentFields())
						$content_fields_output = $listing->setMapContentFields($w2dc_instance->content_fields->getMapContentFields(), $location);
					else 
						$content_fields_output = ''; */
					
					$content_fields_output = $listing->setInfoWindowContent($this->map_id, $location, $show_summary_button, $show_readmore_button);
	
					$this->listings_array[] = $listing;
					$this->locations_array[] = $location;
					$this->locations_option_array[] = array(
							$location->id,
							$location->map_coords_1,
							$location->map_coords_2,
							$location->map_icon_file,
							$location->map_icon_color,
							$listing->map_zoom,
							$listing->title(),
							$logo_image,
							$listing_link,
							$content_fields_output,
							'post-' . $listing->post->ID,
							($listing->level->nofollow) ? 1 : 0,
					);
				}
			}
		}

		if ($this->locations_option_array)
			return true;
		else
			return false;
	}
	
	public function collectLocationsForAjax($listing) {	
		global $w2dc_address_locations, $w2dc_tax_terms_locations;

		foreach ($listing->locations AS $location) {
			if ((!$w2dc_address_locations || in_array($location->id, $w2dc_address_locations))  && (!$w2dc_tax_terms_locations || in_array($location->selected_location, $w2dc_tax_terms_locations))) {
				if (($location->map_coords_1 && $location->map_coords_1 != '0.000000') || ($location->map_coords_2 && $location->map_coords_2 != '0.000000')) {
					$this->listings_array[] = $listing;
					$this->locations_array[] = $location;
					$this->locations_option_array[] = array(
							$location->id,
							$location->map_coords_1,
							$location->map_coords_2,
							$location->map_icon_file,
							$location->map_icon_color,
							null,
							null,
							null,
							null,
							null,
							null,
							null,
					);
				}
			}
		}
		if ($this->locations_option_array)
			return true;
		else
			return false;
	}
	
	public function buildListingsContent($show_directions_button = true, $show_readmore_button = true) {
		
		if (w2dc_getMapEngine() == 'mapbox') {
			if (!get_option("w2dc_show_directions")) {
				$show_directions_button = false;
			}
		}
		$show_directions_button = apply_filters("w2dc_show_directions_button", $show_directions_button);
		
		$out = '';
		foreach ($this->locations_array AS $key=>$location) {
			$listing = $this->listings_array[$key];
			$listing->setContentFields();
	
			$out .= w2dc_renderTemplate('frontend/listing_location.tpl.php', array('listing' => $listing, 'location' => $location, 'show_directions_button' => $show_directions_button, 'show_readmore_button' => $show_readmore_button), true);
		}
		return $out;
	}
	
	public function buildStaticMap() {
		if (w2dc_getMapEngine() == 'google') {
			$html = '<img src="//maps.googleapis.com/maps/api/staticmap?size=795x350&';
			foreach ($this->locations_array  AS $location) {
				if ($location->map_coords_1 != 0 && $location->map_coords_2 != 0) {
					$html .= 'markers=';
					if (get_option('w2dc_map_markers_type') == 'images' && W2DC_MAP_ICONS_URL && $location->map_icon_file) {
						$html .= 'icon:' . W2DC_MAP_ICONS_URL . 'icons/' . urlencode($location->map_icon_file) . '%7C';
					}
				}
				$html .= $location->map_coords_1 . ',' . $location->map_coords_2 . '&';
			}
			if ($this->map_zoom) {
				$html .= 'zoom=' . $this->map_zoom;
			}
			if (get_option('w2dc_google_api_key')) {
				$html .= '&key='.get_option('w2dc_google_api_key');
			}
			$html .= '" />';
		} elseif (w2dc_getMapEngine() == 'mapbox') {
			$html = '';
			if ($this->map_zoom) {
				$zoom = $this->map_zoom;
			} else {
				$zoom = 10;
			}
			foreach ($this->locations_array  AS $location) {
				$html .= '<address>' . $location->getWholeAddress(false) . '</address>';
				$html .= '<img src="' . w2dc_getMapBoxStyleForStatic() . '/static/';
				if ($location->map_coords_1 != 0 && $location->map_coords_2 != 0) {
					$html .= 'pin-l+ea3a83(' . $location->map_coords_2 . ',' . $location->map_coords_1 . ')/' . $location->map_coords_2 . ',' . $location->map_coords_1 . ',' . $zoom . '/';
				}
				$html .= '795x350?access_token=' . get_option('w2dc_mapbox_api_key') . '" /><br /><br />';
			}
		}
		return $html;
	}

	public function display($show_directions = true, $static_image = false, $enable_radius_circle = true, $enable_clusters = true, $show_summary_button = true, $show_readmore_button = true, $width = false, $height = false, $sticky_scroll = false, $sticky_scroll_toppadding = 10, $map_style_name = '', $search_form = false, $draw_panel = false, $custom_home = false, $enable_full_screen = true, $enable_wheel_zoom = true, $enable_dragging_touchscreens = true, $center_map_onclick = false) {
		$do_display_map = apply_filters('w2dc_do_display_map', true, $this);
		if ($do_display_map) {
			$locations_options = json_encode($this->locations_option_array);
			$map_args = json_encode($this->args);
			w2dc_renderTemplate('maps/map.tpl.php',
					array(
							'locations_options' => $locations_options,
							'locations_array' => $this->locations_array,
							'show_directions' => $show_directions,
							'static_image' => $static_image,
							'enable_radius_circle' => $enable_radius_circle,
							'enable_clusters' => $enable_clusters,
							'map_zoom' => $this->map_zoom,
							'show_summary_button' => $show_summary_button,
							'show_readmore_button' => $show_readmore_button,
							'map_style' => w2dc_getSelectedMapStyle($map_style_name),
							'search_form' => $search_form,
							'draw_panel' => $draw_panel,
							'custom_home' => $custom_home,
							'width' => $width,
							'height' => $height,
							'sticky_scroll' => $sticky_scroll,
							'sticky_scroll_toppadding' => $sticky_scroll_toppadding,
							'enable_full_screen' => $enable_full_screen,
							'enable_wheel_zoom' => $enable_wheel_zoom,
							'enable_dragging_touchscreens' => $enable_dragging_touchscreens,
							'center_map_onclick' => $center_map_onclick,
							'directories' => $this->directories,
							'controller' => $this->controller,
							'map_object' => $this,
							'map_id' => $this->map_id,
							'listings_content' => $this->buildListingsContent(),
							'map_args' => $map_args,
							'args' => $this->args
					));
		}
	}
	
	public function is_ajax_loading() {
		if (isset($this->args['ajax_loading']) && $this->args['ajax_loading'] && ((isset($this->args['start_address']) && $this->args['start_address']) || ((isset($this->args['start_latitude']) && $this->args['start_latitude']) && (isset($this->args['start_longitude']) && $this->args['start_longitude']))))
			return true;
		else
			return false;
	}
}

?>