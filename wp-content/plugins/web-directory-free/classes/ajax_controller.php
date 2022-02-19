<?php 

class w2dc_ajax_controller {

	public function __construct() {
		add_action('wp_ajax_w2dc_get_map_markers', array($this, 'get_map_markers'));
		add_action('wp_ajax_nopriv_w2dc_get_map_markers', array($this, 'get_map_markers'));

		add_action('wp_ajax_w2dc_get_map_marker_info', array($this, 'get_map_marker_info'));
		add_action('wp_ajax_nopriv_w2dc_get_map_marker_info', array($this, 'get_map_marker_info'));

		add_action('wp_ajax_w2dc_get_sharing_buttons', array($this, 'get_sharing_buttons'));
		add_action('wp_ajax_nopriv_w2dc_get_sharing_buttons', array($this, 'get_sharing_buttons'));

		add_action('wp_ajax_w2dc_controller_request', array($this, 'controller_request'));
		add_action('wp_ajax_nopriv_w2dc_controller_request', array($this, 'controller_request'));

		add_action('wp_ajax_w2dc_search_by_poly', array($this, 'search_by_poly'));
		add_action('wp_ajax_nopriv_w2dc_search_by_poly', array($this, 'search_by_poly'));
		
		add_action('wp_ajax_w2dc_select_fa_icon', array($this, 'select_field_icon'));
		add_action('wp_ajax_nopriv_w2dc_select_fa_icon', array($this, 'select_field_icon'));
		
		add_action('wp_ajax_w2dc_contact_form', array($this, 'contact_form'));
		add_action('wp_ajax_nopriv_w2dc_contact_form', array($this, 'contact_form'));

		add_action('wp_ajax_w2dc_keywords_search', array($this, 'keywords_search'));
		add_action('wp_ajax_nopriv_w2dc_keywords_search', array($this, 'keywords_search'));
		
		add_action('wp_ajax_w2dc_add_term', array($this, 'add_term'));
		add_action('wp_ajax_nopriv_w2dc_add_term', array($this, 'add_term'));
		add_action('wp_ajax_w2dc_update_tax_wrapper', array($this, 'update_tax_wrapper'));
		add_action('wp_ajax_nopriv_w2dc_update_tax_wrapper', array($this, 'update_tax_wrapper'));
	}

	public function controller_request() {
		global $w2dc_instance;
		
		$w2dc_instance->setCurrentDirectory();

		$post_args = $_POST;

		switch ($post_args['controller']) {
			case "directory_controller":
			case "listings_controller":
				if ($post_args['controller'] == "directory_controller") {
					$shortcode_atts = array_merge(array(
							'perpage' => (isset($post_args['is_home']) && $post_args['is_home']) ? get_option('w2dc_listings_number_index') : get_option('w2dc_listings_number_excerpt'),
							'onepage' => 0,
							'map_markers_is_limit' => get_option('w2dc_map_markers_is_limit'),
							'sticky_featured' => 0,
							'order_by' => get_option('w2dc_default_orderby'),
							'order' => get_option('w2dc_default_order'),
							'hide_order' => (int)(!(get_option('w2dc_show_orderby_links'))),
							'hide_count' => (int)(!(get_option('w2dc_show_listings_count'))),
							'hide_paginator' => 0,
							'show_views_switcher' => (int)get_option('w2dc_views_switcher'),
							'listings_view_type' => get_option('w2dc_views_switcher_default'),
							'listings_view_grid_columns' => (int)get_option('w2dc_views_switcher_grid_columns'),
							'listing_thumb_width' => (int)get_option('w2dc_listing_thumb_width'),
							'wrap_logo_list_view' => (int)get_option('w2dc_wrap_logo_list_view'),
							'logo_animation_effect' => get_option('w2dc_logo_animation_effect'),
							'hide_content' => 0,
							'rating_stars' => 1,
							'summary_on_logo_hover' => 0,
							'author' => 0,
							'paged' => 1,
							'include_categories_children' => 1,
							'include_get_params' => 1,
							'template' => 'frontend/listings_block.tpl.php',
					), $post_args);
				} else {
					$shortcode_atts = array_merge(array(
							'perpage' => 10,
							'onepage' => 0,
							'sticky_featured' => 0,
							'order_by' => 'post_date',
							'order' => 'DESC',
							'hide_order' => 0,
							'hide_count' => 0,
							'hide_paginator' => 0,
							'show_views_switcher' => 1,
							'listings_view_type' => 'list',
							'listings_view_grid_columns' => 2,
							'listing_thumb_width' => 300,
							'wrap_logo_list_view' => 0,
							'logo_animation_effect' => 1,
							'hide_content' => 0,
							'rating_stars' => 1,
							'summary_on_logo_hover' => 0,
							'author' => 0,
							'paged' => 1,
							'include_categories_children' => 0,
							'include_get_params' => 1,
							'template' => 'frontend/listings_block.tpl.php',
					), $post_args);
				}
				
				$address = false;
				$radius = false;
				if (isset($post_args['address'])) {
					$address = apply_filters('w2dc_search_param_address', $post_args['address']);
				}
				if (isset($post_args['radius'])) {
					$radius = apply_filters('w2dc_search_param_radius', $post_args['radius']);
				}

				// This is required workaround
				if (isset($post_args['order_by'])) {
					$_REQUEST['order_by'] = w2dc_getValue($post_args, 'order_by', $shortcode_atts['order_by']);
					$_REQUEST['order'] = w2dc_getValue($post_args, 'order', $shortcode_atts['order']);
				} elseif ($address && $radius) {
					// When search by radius - order by distance by default instead of ordering by date
					$shortcode_atts['order_by'] = 'distance';
					$shortcode_atts['order'] = 'ASC';
				}

				// Strongly required for paginator
				set_query_var('page', $shortcode_atts['paged']);

				$controller = new w2dc_frontend_controller();
				$controller->init($post_args);
				$controller->hash = $post_args['hash'];
				$controller->args = $shortcode_atts;
				$controller->request_by = 'listings_controller';
				$controller->custom_home = (isset($shortcode_atts['custom_home']) && $shortcode_atts['custom_home']);

				//$default_orderby_args = array('order_by' => $shortcode_atts['order_by'], 'order' => $shortcode_atts['order']);
				$order_args = apply_filters('w2dc_order_args', array(), $shortcode_atts, false);
				
				// while random sorting and we have to exclude already shown listings - do not limit records, we will take needed later
				if (isset($shortcode_atts['existing_listings']) && $order_args['orderby'] == 'rand') {
					$perpage = -1;
				} else {
					$perpage = $shortcode_atts['perpage'];
				}
				
				$args = array(
						'post_type' => W2DC_POST_TYPE,
						'post_status' => 'publish',
						//'meta_query' => array(array('key' => '_listing_status', 'value' => 'active')),
						'posts_per_page' => $perpage,
						'paged' => $shortcode_atts['paged'],
				);
				if ($shortcode_atts['author'])
					$args['author'] = $shortcode_atts['author'];
				// render just one page
				if ($shortcode_atts['onepage'])
					$args['posts_per_page'] = -1;

				$args = array_merge($args, $order_args);
				$args = apply_filters('w2dc_search_args', $args, $shortcode_atts, $shortcode_atts['include_get_params'], $controller->hash);
				if (!empty($shortcode_atts['post__in'])) {
					if (is_string($shortcode_atts['post__in'])) {
						$args = array_merge($args, array('post__in' => explode(',', $shortcode_atts['post__in'])));
					} elseif (is_array($shortcode_atts['post__in'])) {
						$args['post__in'] = $shortcode_atts['post__in'];
					}
				}
				if (!empty($shortcode_atts['post__not_in'])) {
					$args = array_merge($args, array('post__not_in' => explode(',', $shortcode_atts['post__not_in'])));
				}
				
				if (!empty($shortcode_atts['levels']) && !is_array($shortcode_atts['levels'])) {
					if ($levels = array_filter(explode(',', $shortcode_atts['levels']), 'trim')) {
						$controller->levels_ids = $levels;
						add_filter('posts_where', array($controller, 'where_levels_ids'));
					}
				}
				
				if (!empty($shortcode_atts['levels']) || $shortcode_atts['sticky_featured']) {
					add_filter('posts_join', 'w2dc_join_levels');
					if ($shortcode_atts['sticky_featured'])
						add_filter('posts_where', 'w2dc_where_sticky_featured');
				}

				if (!empty($shortcode_atts['directories']) && !empty($shortcode_atts['directories'])) {
					if ($directories_ids = array_filter(explode(',', $shortcode_atts['directories']), 'trim')) {
						$args = w2dc_set_directory_args($args, $directories_ids);
					}
				} elseif (!empty($shortcode_atts['directories']) && $post_args['controller'] == 'directory_controller') {
					$args = w2dc_set_directory_args($args, array($w2dc_instance->current_directory->id));
				}
				
				$args = apply_filters('w2dc_directory_query_args', $args);
				
				$controller->query = new WP_Query($args);
				//var_dump($controller->query->request);

				// adapted for Relevanssi
				if (w2dc_is_relevanssi_search($shortcode_atts)) {
					$controller->query->query_vars['s'] = w2dc_getValue($shortcode_atts, 'what_search');
					$controller->query->query_vars['posts_per_page'] = $perpage;
					relevanssi_do_query($controller->query);
				}
				//var_dump($controller->query->request);
				
				// while random sorting - we have to exclude already shown listings, we are taking only needed
				if (isset($shortcode_atts['existing_listings']) && $order_args['orderby'] == 'rand') {
					$all_posts_count = count($controller->query->posts);
					$existing_listings = array_filter(explode(',', $shortcode_atts['existing_listings']));
					foreach ($controller->query->posts AS $key=>$post) {
						if (in_array($post->ID, $existing_listings)) {
							unset($controller->query->posts[$key]);
						}
					}
					$controller->query->posts = array_values($controller->query->posts);
					$controller->query->posts = array_slice($controller->query->posts, 0, $shortcode_atts['perpage']);

					$controller->query->post_count = count($controller->query->posts);
					$controller->query->found_posts = $all_posts_count;
					$controller->query->max_num_pages = ceil($all_posts_count/$shortcode_atts['perpage']);
				}
				
				if (!empty($post_args['with_map']) || !empty($post_args['map_listings'])) {
					$load_map_markers = true;
				} else {
					$load_map_markers = false;
				}

				$map_args = array();
				if (!empty($post_args['map_markers_is_limit'])) {
					$map_args['map_markers_is_limit'] = true;
				} else {
					$map_args['map_markers_is_limit'] = false;
				}

				$controller->processQuery($load_map_markers, $map_args);

				$base_url_args = apply_filters('w2dc_base_url_args', array());
				if (!empty($post_args['base_url'])) {
					$controller->base_url = add_query_arg($base_url_args, $post_args['base_url']);
				} else { 
					$controller->base_url = w2dc_directoryUrl($base_url_args);
				}
				
				// this does not allow paginator to set up admin_url('admin-ajax.php') in get_pagenum_link()
				global $w2dc_global_base_url;
				$w2dc_global_base_url = $controller->base_url;
				add_filter('get_pagenum_link', array($this, 'get_pagenum_link'));

				$listings_html = '';
				if (!isset($post_args['without_listings']) || !$post_args['without_listings']) {
					if (isset($post_args['do_append']) && $post_args['do_append']) {
						if ($controller->listings)
							while ($controller->query->have_posts()) {
								$controller->query->the_post(); 
								$listings_html .= '<article id="post-' . get_the_ID() . '" class="w2dc-row w2dc-listing ' . $controller->getListingClasses() . '">';
								$listings_html .= $controller->listings[get_the_ID()]->display($controller, false, true);
								$listings_html .= '</article>';
							}
						unset($controller->args['do_append']);
					} else
						$listings_html = w2dc_renderTemplate('frontend/listings_block.tpl.php', array('frontend_controller' => $controller), true);
				}
				wp_reset_postdata();

				$out = array(
						'html' => $listings_html,
						'hash' => $controller->hash,
						'map_markers' => ((!empty($post_args['with_map']) && $controller->map) ? $controller->map->locations_option_array : ''),
						'map_listings' => ((!empty($post_args['map_listings']) && $controller->map) ? $controller->map->buildListingsContent() : ''),
						'hide_show_more_listings_button' => ($shortcode_atts['paged'] >= $controller->query->max_num_pages) ? 1 : 0,
						'sql' => ((defined('WP_DEBUG') && true === WP_DEBUG) ? $controller->query->request : '')
				);
				
				if (isset($w2dc_instance->radius_values_array[$controller->hash]) && isset($w2dc_instance->radius_values_array[$controller->hash]['x_coord']) && isset($w2dc_instance->radius_values_array[$controller->hash]['y_coord'])) {
					$out['radius_params'] = array(
							'radius_value' => $w2dc_instance->radius_values_array[$controller->hash]['radius'],
							'map_coords_1' => $w2dc_instance->radius_values_array[$controller->hash]['x_coord'],
							'map_coords_2' => $w2dc_instance->radius_values_array[$controller->hash]['y_coord'],
							'dimension' => get_option('w2dc_miles_kilometers_in_search')
					);
				}
				
				if ($json = json_encode(w2dc_utf8ize($out))) {
					echo $json;
				} else {
					echo json_last_error_msg();
				}

				break;
		}
		
		die();
	}
	
	public function get_pagenum_link($result) {
		global $w2dc_global_base_url;

		if ($w2dc_global_base_url) {
			preg_match('/paged=(\d+)/', $result, $matches);
			if (isset($matches[1])) {
				global $wp_rewrite;
				if ($wp_rewrite->using_permalinks()) {
					$parsed_url = parse_url($w2dc_global_base_url);
					$query_args = (isset($parsed_url['query'])) ? wp_parse_args($parsed_url['query']) : array();
					foreach ($query_args AS $key=>$arg) {
						if (!is_array($arg)) {
							$query_args[$key] = urlencode($arg);
						}
					}
					$url_without_get = ($pos_get = strpos($w2dc_global_base_url, '?')) ? substr($w2dc_global_base_url, 0, $pos_get) : $w2dc_global_base_url;
					return esc_url(add_query_arg($query_args, trailingslashit(trailingslashit($url_without_get) . 'page/' . $matches[1])));
				} else
					return add_query_arg('page', $matches[1], $w2dc_global_base_url);
			} else 
				return $w2dc_global_base_url;
		}
		return $result;
	}

	public function get_map_markers() {
		global $w2dc_instance;
		
		$w2dc_instance->setCurrentDirectory();

		$post_args = $_POST;
		$hash = $post_args['hash'];

		$map_markers = array();
		$map_listings = '';
		if (isset($post_args['neLat']) && isset($post_args['neLng']) && isset($post_args['swLat']) && isset($post_args['swLng'])) {
			// needed to unset 'ajax_loading' parameter when it is calling by AJAX, then $args will be passed to map controller
			if (isset($post_args['ajax_loading'])) {
				unset($post_args['ajax_loading']);
			}
			
			$address = false;
			$radius = false;
			if (isset($post_args['address'])) {
				$address = apply_filters('w2dc_search_param_address', $post_args['address']);
			}
			if (isset($post_args['radius'])) {
				$radius = apply_filters('w2dc_search_param_radius', $post_args['radius']);
			}
			
			if ($radius && $address) {
				// When search by radius - order by distance by default instead of ordering by date
				$post_args['order_by'] = 'distance';
				$post_args['order'] = 'ASC';
			}
			
			if (!isset($post_args['directories'])) {
				$post_args['directories'] = $w2dc_instance->current_directory->id;
			}
			
			$post_args['custom_home'] = 0;

			$map_controller = new w2dc_map_controller();
			$map_controller->hash = $hash;
			$map_controller->init($post_args);
			wp_reset_postdata();
			
			$map_markers = $map_controller->map->locations_option_array;
			if (!empty($post_args['map_listings'])) {
				$map_listings = $map_controller->map->buildListingsContent();
			}
		}
			
		$listings_html = '';
		if ((!isset($post_args['without_listings']) || !$post_args['without_listings'])) {
			$shortcode_atts = array_merge(array(
					'perpage' => 10,
					'onepage' => 0,
					'sticky_featured' => 0,
					'order_by' => 'post_date',
					'order' => 'DESC',
					'hide_order' => 0,
					'hide_count' => 0,
					'hide_paginator' => 0,
					'show_views_switcher' => 1,
					'listings_view_type' => 'list',
					'listings_view_grid_columns' => 2,
					'listing_thumb_width' => 300,
					'wrap_logo_list_view' => 0,
					'logo_animation_effect' => 1,
					'author' => 0,
					'paged' => 1,
					'ajax_initial_load' => 0,
					'template' => 'frontend/listings_block.tpl.php',
			), $post_args);

			$post_ids = array();
			if (isset($map_controller->map->locations_array) && $map_controller->map->locations_array) {
				foreach ($map_controller->map->locations_array AS $location)
					$post_ids[] = $location->post_id;
				$shortcode_atts['post__in'] = $post_ids;
			} else {
				$shortcode_atts['post__in'] = array(0);
			}
			
			if (!isset($post_args['directories'])) {
				$shortcode_atts['directories'] = $w2dc_instance->current_directory->id;
			}
			
			// Strongly required for paginator
			set_query_var('page', $shortcode_atts['paged']);

			$listings_controller = new w2dc_listings_controller();
			$listings_controller->init($shortcode_atts);
			$listings_controller->hash = $hash;
			
			//var_dump($listings_controller->query->request);
			
			$base_url_args = apply_filters('w2dc_base_url_args', array());
			if (isset($post_args['base_url']) && $post_args['base_url']) {
				$listings_controller->base_url = add_query_arg($base_url_args, $post_args['base_url']);
			} else {
				$listings_controller->base_url = w2dc_directoryUrl($base_url_args);
			}
			
			global $w2dc_global_base_url;
			$w2dc_global_base_url = $listings_controller->base_url;
			add_filter('get_pagenum_link', array($this, 'get_pagenum_link'));

			$listings_html = w2dc_renderTemplate('frontend/listings_block.tpl.php', array('frontend_controller' => $listings_controller), true);
			wp_reset_postdata();
		}

		$out = array(
				'html' => $listings_html,
				'hash' => $hash,
				'map_markers' => $map_markers,
				'map_listings' => $map_listings,
		);

		if (isset($w2dc_instance->radius_values_array[$hash]) && isset($w2dc_instance->radius_values_array[$hash]['x_coord']) && isset($w2dc_instance->radius_values_array[$hash]['y_coord'])) {
			$out['radius_params'] = array(
					'radius_value' => $w2dc_instance->radius_values_array[$hash]['radius'],
					'map_coords_1' => $w2dc_instance->radius_values_array[$hash]['x_coord'],
					'map_coords_2' => $w2dc_instance->radius_values_array[$hash]['y_coord'],
					'dimension' => get_option('w2dc_miles_kilometers_in_search')
			);
		}
			
		if ($json = json_encode(w2dc_utf8ize($out))) {
			echo $json;
		} else {
			echo json_last_error_msg();
		}

		die();
	}
	
	public function search_by_poly() {
		global $w2dc_instance;

		$post_args = $_POST;
		$hash = $post_args['hash'];
		
		$out = array(
				'hash' => $hash
		);
		
		$w2dc_instance->setCurrentDirectory();

		$map_markers = array();
		$map_listings = '';
		if (isset($post_args['geo_poly']) && $post_args['geo_poly']) {
			$map_controller = new w2dc_map_controller();
			$map_controller->hash = $hash;
			// Here we need to remove any location-based parameters, leave only content-based (like categories, content fields, ....)
			$post_args['ajax_loading'] = 0; // ajax loading always OFF
			$post_args['ajax_markers_loading'] = 0; // ajax infowindow always OFF
			$post_args['radius'] = 0; // this is not the case for radius search
			$post_args['address'] = ''; // this is not the case for address search
			$post_args['location_id'] = 0; // this is not the case for search by location ID
			$post_args['locations'] = ''; // this is not the case for search by locations
			$post_args['custom_home'] = 0;
			if (!isset($post_args['directories'])) {
				$post_args['directories'] = $w2dc_instance->current_directory->id;
			}
			$map_controller->init($post_args);
			wp_reset_postdata();

			$map_markers = $map_controller->map->locations_option_array;
			if (!empty($post_args['map_listings'])) {
				$map_listings = $map_controller->map->buildListingsContent();
			}
		}
		
		$listings_html = '';
		if ((!isset($post_args['without_listings']) || !$post_args['without_listings'])) {
			$shortcode_atts = array_merge(array(
					'perpage' => 10,
					'onepage' => 0,
					'sticky_featured' => 0,
					'order_by' => 'post_date',
					'order' => 'DESC',
					'hide_order' => 0,
					'hide_count' => 0,
					'hide_paginator' => 0,
					'show_views_switcher' => 1,
					'listings_view_type' => 'list',
					'listings_view_grid_columns' => 2,
					'listing_thumb_width' => 300,
					'wrap_logo_list_view' => 0,
					'logo_animation_effect' => 1,
					'author' => 0,
					'paged' => 1,
					'ajax_initial_load' => 0,
					'template' => 'frontend/listings_block.tpl.php',
			), $post_args);

			if (isset($map_controller->map->locations_array) && $map_controller->map->locations_array) {
				$post_ids = array();
				foreach ($map_controller->map->locations_array AS $location) {
					$post_ids[] = $location->post_id;
				}
				$shortcode_atts['post__in'] = $post_ids;
			} else {
				$shortcode_atts['post__in'] = 0;
			}
			
			if (!isset($post_args['directories'])) {
				$shortcode_atts['directories'] = $w2dc_instance->current_directory->id;
			}
			
			// Strongly required for paginator
			set_query_var('page', $shortcode_atts['paged']);

			$listings_controller = new w2dc_listings_controller();
			$listings_controller->init($shortcode_atts);
			$listings_controller->hash = $hash;
			
			$base_url_args = apply_filters('w2dc_base_url_args', array());
			if (isset($post_args['base_url']) && $post_args['base_url']) {
				$listings_controller->base_url = add_query_arg($base_url_args, $post_args['base_url']);
			} else {
				$listings_controller->base_url = w2dc_directoryUrl($base_url_args);
			}
				
			global $w2dc_global_base_url;
			$w2dc_global_base_url = $listings_controller->base_url;
			add_filter('get_pagenum_link', array($this, 'get_pagenum_link'));
		
			$listings_html = w2dc_renderTemplate('frontend/listings_block.tpl.php', array('frontend_controller' => $listings_controller), true);
			wp_reset_postdata();
		}
		
		$out['html'] = $listings_html;
		$out['map_markers'] = $map_markers;
		$out['map_listings'] = $map_listings;

		if ($json = json_encode(w2dc_utf8ize($out))) {
			echo $json;
		} else {
			echo json_last_error_msg();
		}
	
		die();
	}
	
	public function get_map_marker_info() {
		global $w2dc_instance, $wpdb;

		if (isset($_POST['location_id']) && is_numeric($_POST['location_id'])) {
			$location_id = $_POST['location_id'];
			$map_id = $_POST['map_id'];
			$show_summary_button = $_POST['show_summary_button'];
			$show_readmore_button = $_POST['show_readmore_button'];

			$row = $wpdb->get_row("SELECT * FROM {$wpdb->w2dc_locations_relationships} WHERE id=".$location_id, ARRAY_A);

			if ($row && $row['location_id'] || $row['map_coords_1'] != '0.000000' || $row['map_coords_2'] != '0.000000' || $row['address_line_1'] || $row['zip_or_postal_index']) {
				$listing = new w2dc_listing;
				if ($listing->loadListingFromPost($row['post_id'])) {
					$location = new w2dc_location($row['post_id']);
					$location_settings['id'] = w2dc_getValue($row, 'id');
					$location_settings['selected_location'] = w2dc_getValue($row, 'location_id');
					$location_settings['address_line_1'] = w2dc_getValue($row, 'address_line_1');
					$location_settings['address_line_2'] = w2dc_getValue($row, 'address_line_2');
					$location_settings['zip_or_postal_index'] = w2dc_getValue($row, 'zip_or_postal_index');
					$location_settings['additional_info'] = w2dc_getValue($row, 'additional_info');
					if ($listing->level->map) {
						$location_settings['manual_coords'] = w2dc_getValue($row, 'manual_coords');
						$location_settings['map_coords_1'] = w2dc_getValue($row, 'map_coords_1');
						$location_settings['map_coords_2'] = w2dc_getValue($row, 'map_coords_2');
						if ($listing->level->map_markers) {
							$location_settings['map_icon_file'] = w2dc_getValue($row, 'map_icon_file');
						}
					}
					$location->createLocationFromArray($location_settings);
						
					$logo_image = '';
					if ($listing->logo_image) {
						$logo_image = $listing->get_logo_url(array(80, 80));
					}
						
					$listing_link = '';
					if ($listing->level->listings_own_page) {
						$listing_link = get_permalink($listing->post->ID);
					}
						
					$content_fields_output = $listing->setInfoWindowContent($map_id, $location, $show_summary_button, $show_readmore_button);

					$locations_option_array = array(
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
					);
						
					if ($json = json_encode($locations_option_array)) {
						echo $json;
					} else {
						echo json_last_error_msg();
					}
				}
			}
		}
		die();
	}
	
	public function select_field_icon() {
		w2dc_renderTemplate('select_fa_icons.tpl.php', array('icons' => w2dc_get_fa_icons_names()));
		die();
	}
	
	public function get_sharing_buttons() {
		w2dc_renderTemplate('frontend/sharing_buttons_ajax_response.tpl.php', array('post_id' => $_POST['post_id'], 'post_url' => $_POST['post_url']));
		die();
	}
	
	public function contact_form() {
		$success = '';
		$error = '';
		if (!($type = $_REQUEST['type'])) {
			$error = __('The type of message required!', 'W2DC');
		} else {
			check_ajax_referer('w2dc_' . $type . '_nonce', 'security');
	
			$validation = new w2dc_form_validation;
			if (!is_user_logged_in()) {
				$validation->set_rules('name', __('Contact name', 'W2DC'), 'required');
				$validation->set_rules('email', __('Contact email', 'W2DC'), 'required|valid_email');
			}
			$validation->set_rules('listing_id', __('Listing ID', 'W2DC'), 'required');
			$validation->set_rules('message', __('Your message', 'W2DC'), 'required|max_length[1500]');
			if ($validation->run()) {
				$listing = new w2dc_listing();
				if ($listing->loadListingFromPost($validation->result_array('listing_id'))) {
					if (!is_user_logged_in()) {
						$name = $validation->result_array('name');
						$email = $validation->result_array('email');
					} else {
						$current_user = wp_get_current_user();
						$name = $current_user->display_name;
						$email = $current_user->user_email;
					}
					$message = $validation->result_array('message');
		
					if (w2dc_is_recaptcha_passed()) {
						if ($type == 'contact') {
							if (get_option('w2dc_custom_contact_email') && $listing->contact_email) {
								$send_to_email = $listing->contact_email;
							} else {
								$listing_owner = get_userdata($listing->post->post_author);
								$send_to_email = $listing_owner->user_email;
							}
						} elseif ($type == 'report') {
							$send_to_email = get_option('admin_email');
						}
		
						$headers[] = "From: $name <$email>";
						$headers[] = "Reply-To: $email";
						$headers[] = "Content-Type: text/html";
	
						$subject = sprintf(__('%s contacted you about listing "%s"', 'W2DC'), $name, $listing->title());
		
						$body = w2dc_renderTemplate('emails/' . $type . '_form.tpl.php',
								array(
										'name' => $name,
										'email' => $email,
										'message' => $message,
										'listing_title' => $listing->title(),
										'listing_url' => get_permalink($listing->post->ID)
								), true);
	
						do_action('w2dc_send_' . $type . '_email', $listing, $send_to_email, $subject, $body, $headers);
						
						if (w2dc_mail($send_to_email, $subject, $body, $headers)) {
							unset($_POST['name']);
							unset($_POST['email']);
							unset($_POST['message']);
							$success = __('Your message was sent successfully!', 'W2DC');
						} else {
							$error = esc_attr__("An error occurred and your message wasn't sent!", 'W2DC');
						}
					} else {
						$error = esc_attr__("Anti-bot test wasn't passed!", 'W2DC');
					}
				}
			} else {
				$error = $validation->error_array();
			}
		}
	
		echo json_encode(array('error' => $error, 'success' => $success));
	
		die();
	}
	
	public function keywords_search() {
		$validation = new w2dc_form_validation;
		$validation->set_rules('term', __('Search term', 'W2DC'));
		$validation->set_rules('directories', __('Directories IDs', 'W2DC'));
		if ($validation->run()) {
			$term = $validation->result_array('term');
			$directories = $validation->result_array('directories');
			
			$default_orderby_args = array('order_by' => get_option('w2dc_default_orderby'), 'order' => get_option('w2dc_default_order'));
			$order_args = apply_filters('w2dc_order_args', array(), $default_orderby_args);
		
			$args = array(
					'post_type' => W2DC_POST_TYPE,
					'post_status' => 'publish',
					'posts_per_page' => apply_filters('w2dc_ajax_search_listings_number', 10),
					's' => $term
			);
			$args = array_merge($args, $order_args);
			
			if ($directories) {
				$directories = explode(',', $directories);
				$args = w2dc_set_directory_args($args, $directories);
			}

			$query = new WP_Query($args);
			
			// adapted for Relevanssi
			if (w2dc_is_relevanssi_search()) {
				$query->query_vars['s'] = $term;
				$query->query_vars['posts_per_page'] = apply_filters('w2dc_ajax_search_listings_number', 10);
				relevanssi_do_query($query);
			}
			
			// disable hyphens to dashes conversion
			remove_filter('the_title', 'wptexturize');
			
			$listings_json = array();
			while ($query->have_posts()) {
				$query->the_post();
			
				$listing = new w2dc_listing;
				$listing->loadListingFromPost(get_post());
				
				$content = w2dc_crop_content($listing->post->ID, get_option('w2dc_excerpt_length'), get_option('w2dc_strip_excerpt'), false, false, '...');
				
				if (!$listing->level->listings_own_page) {
					$title = '<strong>' . $listing->title() . '</strong>';
				} else {
					$target = apply_filters('w2dc_listing_title_search_target', 'target="_blank"');
					
					$link_begin = '<a href="' . get_the_permalink() . '" ' . $target . ' title="' . esc_attr__("open listing", "W2DC") . '" ' . (($listing->level->nofollow) ? 'rel="nofollow"' : '') . '>';
					$link_end = '</a>';
					
					$title = '<strong>' . $link_begin . $listing->title() . $link_end . '</strong>';
					
					$content = $link_begin . $content . $link_end;
				}
				
				if ($listing->logo_image) {
					$listing_logo = $listing->get_logo_url(array(50, 50));
				} else {
					$listing_logo = get_option('w2dc_nologo_url');
				}

				$listing_json_field = array();
				$listing_json_field['title'] = apply_filters('w2dc_listing_title_search_html', $title, $listing);
				$listing_json_field['name'] = $listing->title();
				$listing_json_field['url'] = get_the_permalink();
				$listing_json_field['icon'] = $listing_logo;
				$listing_json_field['sublabel'] = $content;
				$listings_json[] = $listing_json_field;
			}
			
			if ($json = json_encode(array('listings' => $listings_json))) {
				echo $json;
			} else {
				echo json_last_error_msg();
			}
		}
		
		die();
	}
	
	public function add_term() {
		global $w2dc_instance;
		
		$tax = w2dc_getValue($_POST, 'tax');
		$parent_id = w2dc_getValue($_POST, 'parent_id');
		$val = w2dc_getValue($_POST, 'val');
		
		if ($val) {
			check_ajax_referer('w2dc_add_term_nonce', 'security');
			
			$locations_levels = $w2dc_instance->locations_levels;
			if ($locations_levels->isAddTermAllowed($parent_id)) {
				$term = wp_insert_term($val, $tax, array(
					'parent' => $parent_id,
				));
				
				if (!is_wp_error($term)) {
					echo trim($term['term_id']);
				}
			}
		}
		
		die();
	}
	
	public function update_tax_wrapper() {
		global $w2dc_instance;
		
		$tax = w2dc_getValue($_POST, 'tax');
		$selected_term = w2dc_getValue($_POST, 'selected_term');
		$uID = w2dc_getValue($_POST, 'uid');
		if (w2dc_getValue($_POST, 'exact_terms')) {
			$exact_terms = explode(',', w2dc_getValue($_POST, 'exact_terms'));
		} else {
			$exact_terms = array();
		}
		
		$locations_levels = $w2dc_instance->locations_levels;
		
		if (w2dc_is_anyone_in_taxonomy($tax)) {
			w2dc_tax_dropdowns_init(
				array(
						'tax' => $tax,
						'term_id' => $selected_term,
						'count' => false,
						'labels' => $locations_levels->getNamesArray(),
						'titles' => $locations_levels->getSelectionsArray(),
						'allow_add_term' => $locations_levels->getAllowAddTermArray(),
						'uID' => $uID,
						'exact_locations' => $exact_terms,
				)
			);
		}
		
		die();
	}
}
?>