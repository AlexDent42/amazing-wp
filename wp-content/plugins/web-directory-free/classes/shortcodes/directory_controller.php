<?php 

class w2dc_directory_controller extends w2dc_frontend_controller {
	public $is_home = false;
	public $is_search = false;
	public $is_single = false;
	public $is_listing = false;
	public $is_directory_page = false;
	public $object_single;
	public $listing;
	public $is_category = false;
	public $is_location = false;
	public $is_tag = false;
	public $is_favourites = false;
	public $custom_home = false;
	public $is_map_on_page = 1;
	public $request_by = 'directory_controller';

	public function init($shortcode_atts = array(), $shortcode = W2DC_MAIN_SHORTCODE) {
		global $w2dc_instance;
		
		parent::init($shortcode_atts);

		if (isset($shortcode_atts['custom_home']) && $shortcode_atts['custom_home']) {
			$this->custom_home = true;
		}

		if (get_query_var('page')) {
			$paged = get_query_var('page');
		} elseif (get_query_var('paged')) {
			$paged = get_query_var('paged');
		} else {
			$paged = 1;
		}

		$common_search_args = array(
				'show_radius_search' => (int)get_option('w2dc_show_radius_search'),
				'radius' =>  (int)get_option('w2dc_radius_search_default'),
				'show_categories_search' => (int)get_option('w2dc_show_categories_search'),
				'categories_search_level' => (int)get_option('w2dc_categories_search_nesting_level'),
				'show_keywords_search' => (int)get_option('w2dc_show_keywords_search'),
				'keywords_ajax_search' => (int)get_option('w2dc_keywords_ajax_search'),
				'keywords_search_examples' => get_option('w2dc_keywords_search_examples'),
				'show_locations_search' => (int)get_option('w2dc_show_locations_search'),
				'locations_search_level' => (int)get_option('w2dc_locations_search_nesting_level'),
				'show_address_search' => (int)get_option('w2dc_show_address_search'),
				'search_overlay' => (int)get_option('w2dc_search_overlay'),
				'scroll_to' => get_option('w2dc_auto_scroll_on_search') ? 'listings' : '',
				'hide_search_button' => (int)get_option('w2dc_hide_search_button'),
		);
		$search_args = array_merge(array(
				'custom_home' => 1,
				'directory' => $w2dc_instance->current_directory->id,
			), $common_search_args
		);
		$map_args = array_merge(array(
				'search_on_map_open' => 0,
				'start_zoom' => get_option('w2dc_start_zoom'),
				'geolocation' => get_option('w2dc_enable_geolocation'),
			), $common_search_args
		);
		
		$process_directory_controller = apply_filters("w2dc_do_process_directory_controller", false);
		
		// place levels="" parameter into the shortcode 
		if (isset($shortcode_atts['levels']) && !is_array($shortcode_atts['levels'])) {
			if ($levels = array_filter(explode(',', $shortcode_atts['levels']), 'trim')) {
				$this->levels_ids = $levels;
				add_filter('posts_join', 'w2dc_join_levels');
				add_filter('posts_where', array($this, 'where_levels_ids'));
			}
		}

		if ($process_directory_controller) {
			
		} elseif ($listing = w2dc_isListing()) {
			$args = array(
					'post_type' => W2DC_POST_TYPE,
					'name' => $listing->post->post_name,
					'posts_per_page' => 1,
			);
				
			add_filter('post_limits', array($this, 'findOnlyOnePost'));
			$this->query = new WP_Query($args);
			remove_filter('post_limits', array($this, 'findOnlyOnePost'));
			$this->processQuery(true);
			// Map uID must be absolutely unique on single listing page
			$this->hash = md5(time());

			if (count($this->listings)) {
				$listings_array = $this->listings;
				$listing = array_shift($listings_array);
				$this->listing = $listing;
				$this->object_single = $listing;
				if ((!$this->listing->level->listings_own_page || $this->listing->post->post_status != 'publish') && !current_user_can('edit_others_posts')) {
					wp_redirect(w2dc_directoryUrl());
				}
				
				global $wp_rewrite;
				if ($wp_rewrite->using_permalinks() && ((get_option('w2dc_permalinks_structure') == 'category_slug' || get_option('w2dc_permalinks_structure') == 'location_slug' || get_option('w2dc_permalinks_structure') == 'tag_slug'))) {
					switch (get_option('w2dc_permalinks_structure')) {
						case 'category_slug':
							if ($terms = get_the_terms($this->listing->post->ID, W2DC_CATEGORIES_TAX)) {
								$term_number = 0;
								if (count($terms) > 1) {
									foreach ($terms AS $term) {
										$term_number++;
										if ($parents = w2dc_get_term_parents_slugs($term->term_id, W2DC_CATEGORIES_TAX)) {
											$uri = implode('/', $parents);
											if ($uri == get_query_var('tax-slugs-w2dc')) {
												break;
											}
										}
									}
								}
								
								$term = array_shift($terms);
								$uri = '';
								if ($parents = w2dc_get_term_parents_slugs($term->term_id, W2DC_CATEGORIES_TAX))
									$uri = implode('/', $parents);
								if ($uri != get_query_var('tax-slugs-w2dc')) {
									$permalink = get_the_permalink($this->listing->post->ID);
									if ($term_number > 1) {
										$permalink = add_query_arg('term_number', $term_number, $permalink);
									}
									wp_redirect($permalink, 301);
									die();
								}
							}
							break;
						case 'location_slug':
							if ($terms = get_the_terms($this->listing->post->ID, W2DC_LOCATIONS_TAX)) {
								$term_number = 0;
								if (count($terms) > 1) {
									foreach ($terms AS $term) {
										$term_number++;
										if ($parents = w2dc_get_term_parents_slugs($term->term_id, W2DC_LOCATIONS_TAX)) {
											$uri = implode('/', $parents);
											if ($uri == get_query_var('tax-slugs-w2dc')) {
												break;
											}
										}
									}
								}
								
								$term = array_shift($terms);
								$uri = '';
								if ($parents = w2dc_get_term_parents_slugs($term->term_id, W2DC_LOCATIONS_TAX))
									$uri = implode('/', $parents);
								if ($uri != get_query_var('tax-slugs-w2dc')) {
									$permalink = get_the_permalink($this->listing->post->ID);
									if ($term_number > 1) {
										$permalink = add_query_arg('term_number', $term_number, $permalink);
									}
									wp_redirect($permalink, 301);
									die();
								}
							}
							break;
						case 'tag_slug':
							if (($terms = get_the_terms($post->ID, W2DC_TAGS_TAX)) && ($term = array_shift($terms))) {
								if ($term->slug != get_query_var('tax-slugs-w2dc')) {
									wp_redirect(get_the_permalink($this->listing->post->ID), 301);
									die();
								}
							}
							break;
					}
				}
				
				$this->is_single = true;
				$this->is_listing = true;
				$this->template = 'frontend/listing_single.tpl.php';
				
				if (w2dc_is_user_allowed($listing->level->who_can_view)) {
					if (!wp_doing_ajax()) {
						$this->listing->increaseClicksStats();
					}
				} else {
					w2dc_addMessage(esc_html__("Sorry, you are not allowed to view this page.", "W2DC"));
					$this->template = 'frontend/listing_single_blocked.tpl.php';
				}
				
				// here directory ID we will take from post meta
				$w2dc_instance->setCurrentDirectory();

				$this->page_title = $listing->title();

				if (get_option('w2dc_enable_breadcrumbs')) {
					switch (get_option('w2dc_breadcrumbs_mode')) {
						case 'category':
							if ($terms = get_the_terms($this->listing->post->ID, W2DC_CATEGORIES_TAX)) {
								if (!empty($_GET['term_number']) && isset($terms[$_GET['term_number']-1]) && get_option('w2dc_permalinks_structure') == 'category_slug') {
									$term = $terms[$_GET['term_number']-1];
								} else {
									$term = array_shift($terms);
								}
								$this->addBreadCrumbs(w2dc_get_term_parents($term, W2DC_CATEGORIES_TAX, true, true));
							}
							break;
						case 'location':
							if ($terms = get_the_terms($this->listing->post->ID, W2DC_LOCATIONS_TAX)) {
								if (!empty($_GET['term_number']) && isset($terms[$_GET['term_number']-1]) && get_option('w2dc_permalinks_structure') == 'location_slug') {
									$term = $terms[$_GET['term_number']-1];
								} else {
									$term = array_shift($terms);
								}
								$this->addBreadCrumbs(w2dc_get_term_parents($term, W2DC_LOCATIONS_TAX, true, true));
							}
							break;
					}
					$this->addBreadCrumbs($listing->title());
				}

				if (get_option('w2dc_listing_contact_form') && defined('WPCF7_VERSION') && w2dc_get_wpml_dependent_option('w2dc_listing_contact_form_7')) {
					add_filter('wpcf7_form_action_url', array($this, 'w2dc_add_listing_id_to_wpcf7'));
					add_filter('wpcf7_form_hidden_fields', array($this, 'w2dc_add_listing_id_to_wpcf7_field'));
					// Add duplicated hidden tag _wpcf7_container_post to set real post ID
					add_filter('wpcf7_form_elements', array($this, 'w2dc_add_wpcf7_container_post'));
				}
				
				if (get_option("w2dc_imitate_mode")) {
					add_filter('language_attributes', array($this, 'add_opengraph_doctype'));
					// Disable OpenGraph in Jetpack
					if (get_option('w2dc_share_buttons')) {
						add_filter('jetpack_enable_open_graph', '__return_false', 99);
					}
					add_action('wp_head', array($this, 'change_global_post'), -1000);
					add_action('wp_head', array($this, 'back_global_post'), 1000);
					add_action('wp_head', array($this, 'insert_fb_in_head'), -10);
					if (function_exists('rel_canonical')) {
						remove_action('wp_head', 'rel_canonical');
					}
					// replace the default WordPress canonical URL function with your own
					add_action('wp_head', array($this, 'rel_canonical_with_custom_tag_override'));
				}
			} else {
				$this->set404();
			}
		} elseif ($w2dc_instance->action == 'search') {
			$this->is_search = true;
			$this->template = 'frontend/search.tpl.php';
			
			if (!get_option('w2dc_map_on_excerpt'))
				$this->is_map_on_page = 0;

			if (get_option('w2dc_main_search')) {
				$this->search_form = new w2dc_search_form($this->hash, $this->request_by, $search_args);
			}

			$default_orderby_args = array('order_by' => get_option('w2dc_default_orderby'), 'order' => get_option('w2dc_default_order'));
			
			$get_params = $_GET;
			array_walk_recursive($get_params, 'sanitize_text_field');
			$this->args = array_merge($default_orderby_args, $get_params);
			
			$perpage = w2dc_getValue($shortcode_atts, 'perpage', (int)get_option('w2dc_listings_number_excerpt'));

			if (!get_option('w2dc_ajax_initial_load')) {
				$order_args = apply_filters('w2dc_order_args', array(), $default_orderby_args);
	
				$args = array(
						'post_type' => W2DC_POST_TYPE,
						'post_status' => 'publish',
						'posts_per_page' => $perpage,
						'paged' => $paged,
				);
				$args = array_merge($args, $order_args);
				$args = apply_filters('w2dc_search_args', $args, array('include_categories_children' => 1), true, $this->hash);
				
				$args = w2dc_set_directory_args($args, array($w2dc_instance->current_directory->id));
				
				$args = apply_filters('w2dc_directory_query_args', $args);
				
				$this->query = new WP_Query($args);
				//var_dump($this->query->request);
				
				// adapted for Relevanssi
				if (w2dc_is_relevanssi_search()) {
					relevanssi_do_query($this->query);
				}

				$this->processQuery(get_option('w2dc_map_on_excerpt'), $map_args);
			} else {
				$this->do_initial_load = false;
				if ($this->is_map_on_page) {
					$this->map = new w2dc_maps($map_args, $this->request_by);
					$this->map->setUniqueId($this->hash);
				}
			}

			$this->page_title = __('Search results', 'W2DC');

			$this->args['perpage'] = $perpage;

			if (get_option('w2dc_enable_breadcrumbs')) {
				$this->addBreadCrumbs(esc_html__('Search results', 'W2DC'));
			}
			$base_url_args = apply_filters('w2dc_base_url_args', array());
			$this->base_url = w2dc_directoryUrl($base_url_args);
		} elseif (get_query_var(W2DC_CATEGORIES_TAX)) {
			if ($category_object = w2dc_isCategory()) {
				$this->is_category = true;
				$this->category = $category_object;

				if (!get_option('w2dc_map_on_excerpt'))
					$this->is_map_on_page = 0;
				
				if (get_option('w2dc_main_search')) {
					$search_args['category'] = $category_object->term_id;
					$this->search_form = new w2dc_search_form($this->hash, $this->request_by, $search_args);
				}

				$default_orderby_args = array('order_by' => get_option('w2dc_default_orderby'), 'order' => get_option('w2dc_default_order'));

				$get_params = $_GET;
				array_walk_recursive($get_params, 'sanitize_text_field');
				$this->args = array_merge($default_orderby_args, $get_params);

				$this->args['categories'] = $category_object->term_id;
				
				$perpage = w2dc_getValue($shortcode_atts, 'perpage', (int)get_option('w2dc_listings_number_excerpt'));

				if (!get_option('w2dc_ajax_initial_load')) {
					$order_args = apply_filters('w2dc_order_args', array(), $default_orderby_args);
	
					$args = array(
							'tax_query' => array(
									array(
										'taxonomy' => W2DC_CATEGORIES_TAX,
										'field' => 'slug',
										'terms' => $category_object->slug,
										//'include_children' => false,  // do not show listings of a child category
									)
							),
							'post_type' => W2DC_POST_TYPE,
							'post_status' => 'publish',
							'posts_per_page' => $perpage,
							'paged' => $paged
					);
					$args = array_merge($args, $order_args);
					
					$args = w2dc_set_directory_args($args, array($w2dc_instance->current_directory->id));
					
					$args = apply_filters('w2dc_directory_query_args', $args);
	
					$this->query = new WP_Query($args);
					//var_dump($this->query->request);
					$this->processQuery($this->is_map_on_page, $map_args);
				} else {
					$this->do_initial_load = false;
					if ($this->is_map_on_page) {
						$this->map = new w2dc_maps($map_args, $this->request_by);
						$this->map->setUniqueId($this->hash);
					}
				}

				$this->args['perpage'] = $perpage;
				$this->template = 'frontend/category.tpl.php';
				$this->page_title = $category_object->name;

				if (get_option('w2dc_enable_breadcrumbs')) {
					$this->addBreadCrumbs(w2dc_get_term_parents($category_object, W2DC_CATEGORIES_TAX, true, true));
				}

				$this->base_url = get_term_link($category_object, W2DC_CATEGORIES_TAX);
			} else {
				$this->set404();
			}
		} elseif (get_query_var(W2DC_LOCATIONS_TAX)) {
			if ($location_object = w2dc_isLocation()) {
				$this->is_location = true;
				$this->location = $location_object;
				
				if (!get_option('w2dc_map_on_excerpt'))
					$this->is_map_on_page = 0;

				global $w2dc_tax_terms_locations;
				$w2dc_tax_terms_locations = get_term_children($location_object->term_id, W2DC_LOCATIONS_TAX);
				$w2dc_tax_terms_locations[] = $location_object->term_id;
				
				if (get_option('w2dc_main_search')) {
					$search_args['location'] = $location_object->term_id;
					$this->search_form = new w2dc_search_form($this->hash, $this->request_by, $search_args);
				}

				$default_orderby_args = array('order_by' => get_option('w2dc_default_orderby'), 'order' => get_option('w2dc_default_order'));
				
				$get_params = $_GET;
				array_walk_recursive($get_params, 'sanitize_text_field');
				$this->args = array_merge($default_orderby_args, $get_params);

				$this->args['location_id'] = $location_object->term_id;
				
				$perpage = w2dc_getValue($shortcode_atts, 'perpage', (int)get_option('w2dc_listings_number_excerpt'));
				
				if (!get_option('w2dc_ajax_initial_load')) {
					$order_args = apply_filters('w2dc_order_args', array(), $default_orderby_args);
	
					$args = array(
							'tax_query' => array(
									array(
										'taxonomy' => W2DC_LOCATIONS_TAX,
										'field' => 'slug',
										'terms' => $location_object->slug,
									)
							),
							'post_type' => W2DC_POST_TYPE,
							'post_status' => 'publish',
							'posts_per_page' => $perpage,
							'paged' => $paged
					);
					$args = array_merge($args, $order_args);
					
					$args = w2dc_set_directory_args($args, array($w2dc_instance->current_directory->id));
					
					$args = apply_filters('w2dc_directory_query_args', $args);
	
					$this->query = new WP_Query($args);
					$this->processQuery($this->is_map_on_page, $map_args);
				} else {
					$this->do_initial_load = false;
					if ($this->is_map_on_page) {
						$this->map = new w2dc_maps($map_args, $this->request_by);
						$this->map->setUniqueId($this->hash);
					}
				}

				$this->args['perpage'] = $perpage;
				$this->template = 'frontend/location.tpl.php';
				$this->page_title = $location_object->name;
				
				if (get_option('w2dc_enable_breadcrumbs')) {
					$this->addBreadCrumbs(w2dc_get_term_parents($location_object, W2DC_LOCATIONS_TAX, true, true));
				}
				
				$this->base_url = get_term_link($location_object, W2DC_LOCATIONS_TAX);
			} else {
				$this->set404();
			}
		} elseif (get_query_var(W2DC_TAGS_TAX)) {
			if ($tag_object = w2dc_isTag()) {
				$this->is_tag = true;
				$this->tag = $tag_object;
				
				if (!get_option('w2dc_map_on_excerpt'))
					$this->is_map_on_page = 0;

				if (get_option('w2dc_main_search')) {
					$this->search_form = new w2dc_search_form($this->hash, $this->request_by, $search_args);
				}

				$default_orderby_args = array('order_by' => get_option('w2dc_default_orderby'), 'order' => get_option('w2dc_default_order'));
				
				$get_params = $_GET;
				array_walk_recursive($get_params, 'sanitize_text_field');
				$this->args = array_merge($default_orderby_args, $get_params);

				$this->args['tags'] = $tag_object->term_id;
				
				$perpage = w2dc_getValue($shortcode_atts, 'perpage', (int)get_option('w2dc_listings_number_excerpt'));
				
				if (!get_option('w2dc_ajax_initial_load')) {
					$order_args = apply_filters('w2dc_order_args', array(), $default_orderby_args);
	
					$args = array(
							'tax_query' => array(
									array(
											'taxonomy' => W2DC_TAGS_TAX,
											'field' => 'slug',
											'terms' => $tag_object->slug,
									)
							),
							'post_type' => W2DC_POST_TYPE,
							'post_status' => 'publish',
							'posts_per_page' => $perpage,
							'paged' => $paged,
					);
					$args = array_merge($args, $order_args);
					
					$args = w2dc_set_directory_args($args, array($w2dc_instance->current_directory->id));
					
					$args = apply_filters('w2dc_directory_query_args', $args);
		
					$this->query = new WP_Query($args);
					$this->processQuery($this->is_map_on_page, $map_args);
				} else {
					$this->do_initial_load = false;
					if ($this->is_map_on_page) {
						$this->map = new w2dc_maps($map_args, $this->request_by);
						$this->map->setUniqueId($this->hash);
					}
				}

				$this->args['perpage'] = $perpage;
				$this->template = 'frontend/tag.tpl.php';
				$this->page_title = $tag_object->name;

				if (get_option('w2dc_enable_breadcrumbs')) {
					$this->addBreadCrumbs($tag_object->name, get_term_link($tag_object->slug, W2DC_TAGS_TAX), esc_attr(sprintf(__('View all listings in %s', 'W2DC'), $tag_object->name)));
				}
				
				$this->base_url = get_term_link($tag_object, W2DC_TAGS_TAX);
			} else {
				$this->set404();
			}
		} elseif ($w2dc_instance->action == 'myfavourites') {
			$this->is_favourites = true;

			if (!$favourites = w2dc_checkQuickList()) {
				$favourites = array(0);
			}
			$args = array(
					'post__in' => $favourites,
					'post_type' => W2DC_POST_TYPE,
					'post_status' => 'publish',
					'posts_per_page' => get_option('w2dc_listings_number_excerpt'),
					'paged' => $paged,
			);
			$this->query = new WP_Query($args);
			$this->processQuery(get_option('w2dc_map_on_excerpt'));
			
			$this->args['perpage'] = get_option('w2dc_listings_number_excerpt');
			$this->template = 'frontend/favourites.tpl.php';
			$this->page_title = __('My bookmarks', 'W2DC');

			if (get_option('w2dc_enable_breadcrumbs')) {
				$this->addBreadCrumbs(esc_html__('My bookmarks', 'W2DC'));
			}
			$this->args['hide_order'] = 1;
		} elseif (!$w2dc_instance->action && $shortcode == W2DC_MAIN_SHORTCODE) {
			$this->is_home = true;
			
			if (!get_option('w2dc_map_on_index'))
				$this->is_map_on_page = 0;

			if (get_option('w2dc_main_search')) {
				$this->search_form = new w2dc_search_form($this->hash, $this->request_by, $search_args);
			}

			$default_orderby_args = array('order_by' => get_option('w2dc_default_orderby'), 'order' => get_option('w2dc_default_order'));

			$get_params = $_GET;
			array_walk_recursive($get_params, 'sanitize_text_field');
			$this->args = array_merge($default_orderby_args, $get_params);
			
			$perpage = w2dc_getValue($shortcode_atts, 'perpage', (int)get_option('w2dc_listings_number_index'));

			if (!get_option('w2dc_ajax_initial_load') && (get_option('w2dc_listings_on_index') || $this->is_map_on_page)) {
				$order_args = apply_filters('w2dc_order_args', array(), $default_orderby_args);

				$args = array(
						'post_type' => W2DC_POST_TYPE,
						'post_status' => 'publish',
						'posts_per_page' => $perpage,
						'paged' => $paged,
				);
				$args = array_merge($args, $order_args);
				
				$args = w2dc_set_directory_args($args, array($w2dc_instance->current_directory->id));
				
				$args = apply_filters('w2dc_directory_query_args', $args);
				
				$this->query = new WP_Query($args);
				//var_dump($this->query->request);
				$this->processQuery($this->is_map_on_page, $map_args);
			} else {
				$this->do_initial_load = false;
				if ($this->is_map_on_page) {
					$this->map = new w2dc_maps($map_args, $this->request_by);
					$this->map->setUniqueId($this->hash);
				}
			}

			$base_url_args = apply_filters('w2dc_base_url_args', array());
			$this->base_url = w2dc_directoryUrl($base_url_args);

			$this->args['perpage'] = $perpage;
			$this->template = 'frontend/index.tpl.php';
			$this->page_title = get_post($w2dc_instance->index_page_id)->post_title;
		}
		$this->args['directories'] = $w2dc_instance->current_directory->id;
		$this->args['is_home'] = $this->is_home;
		$this->args['paged'] = $paged;
		$this->args['custom_home'] = (int)$this->custom_home;

		$this->args['onepage'] = 0;
		$this->args['include_get_params'] = 1;
		$this->args['hide_paginator'] = 0;
		$this->args['hide_count'] = w2dc_getValue($shortcode_atts, 'hide_count', (int)(!(get_option('w2dc_show_listings_count'))));
		$this->args['hide_content'] = w2dc_getValue($shortcode_atts, 'hide_content', 0);
		// Hide order on My Favourites page
		if (!isset($this->args['hide_order'])) {
			$this->args['hide_order'] = w2dc_getValue($shortcode_atts, 'hide_order', (int)(!(get_option('w2dc_show_orderby_links'))));
		}
		$this->args['show_views_switcher'] = w2dc_getValue($shortcode_atts, 'show_views_switcher', (int)get_option('w2dc_views_switcher'));
		$this->args['listings_view_type'] = w2dc_getValue($shortcode_atts, 'listings_view_type', get_option('w2dc_views_switcher_default'));
		$this->args['listings_view_grid_columns'] = w2dc_getValue($shortcode_atts, 'listings_view_grid_columns', (int)get_option('w2dc_views_switcher_grid_columns'));
		$this->args['listing_thumb_width'] = w2dc_getValue($shortcode_atts, 'listing_thumb_width', (int)get_option('w2dc_listing_thumb_width'));
		$this->args['wrap_logo_list_view'] = w2dc_getValue($shortcode_atts, 'wrap_logo_list_view', (int)get_option('w2dc_wrap_logo_list_view'));
		$this->args['logo_animation_effect'] = w2dc_getValue($shortcode_atts, 'logo_animation_effect', (int)get_option('w2dc_logo_animation_effect'));
		$this->args['grid_view_logo_ratio'] = w2dc_getValue($shortcode_atts, 'grid_view_logo_ratio', get_option('w2dc_grid_view_logo_ratio'));
		$this->args['scrolling_paginator'] = w2dc_getValue($shortcode_atts, 'scrolling_paginator', 0);
		$this->args['show_summary_button'] = true;
		$this->args['show_readmore_button'] = true;
		
		if (get_option("w2dc_imitate_mode")) {
			add_action('get_header', array($this, 'configure_seo_filters'), 2);
			
			if (get_option('w2dc_overwrite_page_title')) {
				add_filter('the_title', array($this, 'setThemePageTitle'), 10, 2);
			}
		}
		
		// place levels="" parameter into the shortcode
		if ($this->levels_ids) {
			remove_filter('posts_join', 'w2dc_join_levels');
			remove_filter('posts_where', array($this, 'where_levels_ids'));
		}
	
		// adapted for WPML
		add_filter('icl_ls_languages', array($this, 'adapt_wpml_urls'));

		// this is possible to build custom home page instead of static set of blocks
		if (!$this->is_single && $this->custom_home) {
			$this->template = 'frontend/listings_block.tpl.php';
		}
		
		$this->template = apply_filters('w2dc_frontend_controller_template', $this->template, $this);

		apply_filters('w2dc_directory_controller_construct', $this);
	}
	
	public function set404() {
		global $wp_query;
		$wp_query->set_404();
		status_header(404);
	}
	
	public function setThemePageTitle($title, $id = null) {
		global $w2dc_instance;
	
		if (!is_admin() && !in_the_loop() && is_page() && ($w2dc_instance->index_page_id == $id || in_array($id, $w2dc_instance->listing_pages_all))) {
			return $this->getPageTitle();
		} else {
			return $title;
		}
	}

	public function tempLangToWPML() {
		return $this->temp_lang;
	}
	
	// adapted for WPML
	public function adapt_wpml_urls($w_active_languages) {
		global $sitepress, $w2dc_instance;

		// WPML will not switch language using $sitepress->switch_lang() function when there is 'lang=' parameter in the URL, so we have to use such hack
		if ($sitepress->get_option('language_negotiation_type') == 3)
			remove_all_filters('icl_current_language');

		foreach ($w_active_languages AS $key=>&$language) {
			$sitepress->switch_lang($language['language_code']);
			$this->temp_lang = $language['language_code'];
			add_filter('icl_current_language', array($this, 'tempLangToWPML'));
			$w2dc_instance->getAllDirectoryPages();
			$w2dc_instance->getIndexPage();
			$w2dc_instance->directories->setDirectoriesURLs();

			$is_w2dc_page = false;
			$w2dc_page_url = false;
			if ($this->is_single || $this->is_category || $this->is_location || $this->is_tag || $this->is_favourites) {
				$is_w2dc_page = true;
			}

			if ($this->is_single && ($tobject_post_id = apply_filters('wpml_object_id', $this->object_single->post->ID, W2DC_POST_TYPE, false, $language['language_code']))) {
				$w2dc_page_url = get_permalink($tobject_post_id);
			}
			if ($this->is_category && ($tterm_id = apply_filters('wpml_object_id', $this->category->term_id, W2DC_CATEGORIES_TAX, false, $language['language_code']))) {
				$tterm = get_term($tterm_id, W2DC_CATEGORIES_TAX);
				$w2dc_page_url = get_term_link($tterm);
			}
			if ($this->is_location && ($tterm_id = apply_filters('wpml_object_id', $this->location->term_id, W2DC_LOCATIONS_TAX, false, $language['language_code']))) {
				$tterm = get_term($tterm_id, W2DC_LOCATIONS_TAX);
				$w2dc_page_url = get_term_link($tterm, W2DC_LOCATIONS_TAX);
			}
			if ($this->is_tag && ($tterm_id = apply_filters('wpml_object_id', $this->tag->term_id, W2DC_TAGS_TAX, false, $language['language_code']))) {
				$tterm = get_term($tterm_id, W2DC_TAGS_TAX);
				$w2dc_page_url = get_term_link($tterm, W2DC_TAGS_TAX);
			}
			if ($this->is_favourites) {
				$w2dc_page_url = w2dc_directoryUrl(array('w2dc_action' => 'myfavourites'));
			}

			// show links only to pages, which have translations
			if ($is_w2dc_page) {
				if ($w2dc_page_url)
					$language['url'] = $w2dc_page_url;
				else
					unset($w_active_languages[$key]);
			}

			remove_filter('icl_current_language', array($this, 'tempLangToWPML'));
		}
		$sitepress->switch_lang(ICL_LANGUAGE_CODE);
		$w2dc_instance->getAllDirectoryPages();
		$w2dc_instance->getIndexPage();
		$w2dc_instance->directories->setDirectoriesURLs();
		return $w_active_languages;
	}

	// Add listing ID to query string while rendering Contact Form 7
	public function w2dc_add_listing_id_to_wpcf7($url) {
		if ($this->is_single) {
			$url = esc_url(add_query_arg('listing_id', $this->listing->post->ID, $url));
		}
		
		return $url;
	}
	// Add listing ID to hidden fields while rendering Contact Form 7
	public function w2dc_add_listing_id_to_wpcf7_field($fields) {
		if ($this->is_single) {
			$fields["listing_id"] = $this->listing->post->ID;
		}
		
		return $fields;
	}
	// Add duplicated hidden tag _wpcf7_container_post to set real post ID,
	// we can not overwrite _wpcf7_container_post in wpcf7_form_hidden_fields filter
	public function w2dc_add_wpcf7_container_post($tags) {
		if ($this->is_single) {
			$tags = '<input type="hidden" name="_wpcf7_container_post" value="' . $this->listing->post->ID . '" />' . $tags;
		}
	
		return $tags;
	}
	
	public function configure_seo_filters() {
		if ($this->is_home || $this->is_single || $this->is_search || $this->is_category || $this->is_location || $this->is_tag || $this->is_favourites || $this->is_directory_page) {
				
			// since WP 4.4, just use the new hook.
			add_filter('pre_get_document_title', array($this, 'page_title'), 16);
			add_filter('wp_title', array($this, 'page_title'), 10, 2);
			if (defined('WPSEO_VERSION')) {
				$wpseo_front = WPSEO_Frontend::get_instance();
	
				add_filter('wpseo_metadesc', array($this, 'wpseo_metadesc'));
				add_filter('wpseo_frontend_presentation', array($this, 'wpseo_robots'));
				add_filter('wpseo_canonical', array($this, 'wpseo_canonical'));
	
				// real number of page for WP SEO plugin
				if ($this->query) {
					global $wp_query;
					$wp_query->max_num_pages = $this->query->max_num_pages;
				}
	
				// remove force_rewrite option of WP SEO plugin
				remove_action('template_redirect', array(&$wpseo_front, 'force_rewrite_output_buffer'), 99999);
				remove_action('wp_footer', array(&$wpseo_front, 'flush_cache'), -1);
	
				remove_filter('wp_title', array(&$wpseo_front, 'title'), 15, 3);
				remove_action('wp_head', array(&$wpseo_front, 'head'), 1);
			}
		}
	}
	
	public function wpseo_canonical($url) {
		if ($this->is_single) {
			return get_permalink($this->listing->post);
		} elseif ($this->is_category) {
			return get_term_link($this->category);
		} elseif ($this->is_location) {
			return get_term_link($this->location);
		} elseif ($this->is_tag) {
			return get_term_link($this->tag);
		}
	
		return $url;
	}
	
	public function wpseo_metadesc($metadesc) {
		$wpseo_front = WPSEO_Frontend::get_instance();
	
		if ($this->is_single) {
			global $post;
			$saved_page = $post;
			$post = $this->object_single->post;
				
			$metadesc = YoastSEO()->meta->for_post($this->object_single->post->ID)->description;
				
			$post = $saved_page;
		} elseif ($this->is_category) {
			$metadesc = WPSEO_Taxonomy_Meta::get_term_meta($this->category, $this->category->taxonomy, 'desc');
				
			if (!$metadesc && WPSEO_Options::get('metadesc-tax-' . $this->category->taxonomy)) {
				$metadesc = wpseo_replace_vars(WPSEO_Options::get('metadesc-tax-' . $this->category->taxonomy), (array) $this->category);
			}
		} elseif ($this->is_location) {
			$metadesc = WPSEO_Taxonomy_Meta::get_term_meta($this->location, $this->location->taxonomy, 'desc');
	
			if (!$metadesc && WPSEO_Options::get('metadesc-tax-' . $this->location->taxonomy)) {
				$metadesc = wpseo_replace_vars(WPSEO_Options::get('metadesc-tax-' . $this->location->taxonomy), (array) $this->location);
			}
		} elseif ($this->is_tag) {
			$metadesc = WPSEO_Taxonomy_Meta::get_term_meta($this->tag, $this->tag->taxonomy, 'desc');
				
			if (!$metadesc && WPSEO_Options::get('metadesc-tax-' . $this->tag->taxonomy)) {
				$metadesc = wpseo_replace_vars(WPSEO_Options::get('metadesc-tax-' . $this->tag->taxonomy), (array) $this->tag);
			}
		}
	
		return $metadesc;
	}
	
	public function wpseo_robots($presentation) {
		if ($this->is_single) {
			$presentation->model->is_robots_noindex = 0;
				
			if (WPSEO_Options::get('noindex-' . $this->object_single->post->post_type)) {
				$presentation->model->is_robots_noindex = 1;
			}
				
			$presentation->model->is_robots_nofollow = 0;
			if ($this->listing && $this->listing->level->nofollow) {
				$presentation->model->is_robots_nofollow = 1;
			}
		} elseif ($this->is_category) {
			$presentation->model->is_robots_noindex = 0;
			if (WPSEO_Options::get('noindex-tax-' . $this->category->taxonomy)) {
				$presentation->model->is_robots_noindex = 1;
			}
			$term_meta = WPSEO_Taxonomy_Meta::get_term_meta($this->category, $this->category->taxonomy, 'noindex');
			if (is_string($term_meta) && $term_meta == 'noindex') {
				$presentation->model->is_robots_noindex = 1;
			}
		} elseif ($this->is_location) {
			$presentation->model->is_robots_noindex = 0;
			if (WPSEO_Options::get('noindex-tax-' . $this->location->taxonomy)) {
				$presentation->model->is_robots_noindex = 1;
			}
			$term_meta = WPSEO_Taxonomy_Meta::get_term_meta($this->location, $this->location->taxonomy, 'noindex');
			if (is_string($term_meta) && $term_meta == 'noindex') {
				$presentation->model->is_robots_noindex = 1;
			}
		} elseif ($this->is_tag) {
			$presentation->model->is_robots_noindex = 0;
			if (WPSEO_Options::get('noindex-tax-' . $this->tag->taxonomy)) {
				$presentation->model->is_robots_noindex = 1;
			}
			$term_meta = WPSEO_Taxonomy_Meta::get_term_meta($this->tag, $this->tag->taxonomy, 'noindex');
			if (is_string($term_meta) && $term_meta == 'noindex') {
				$presentation->model->is_robots_noindex = 1;
			}
		}
	
		return $presentation;
	}
	
	public function page_title($title, $separator = '|') {
		global $w2dc_instance;
	
		if (defined('WPSEO_VERSION')) {
			if (version_compare(WPSEO_VERSION, '14.0.0', '<')) {
				// before Yoast SEO v14
	
				$wpseo_front = WPSEO_Frontend::get_instance();
	
				if ($this->is_single) {
					global $post;
					$saved_page = $post;
					$post = $this->object_single->post;
	
					$title = $wpseo_front->get_content_title($post);
						
					$post = $saved_page;
						
					return $title;
				} elseif ($this->is_category) {
					$title = trim(WPSEO_Taxonomy_Meta::get_term_meta($this->category, $this->category->taxonomy, 'title'));
	
					if (!empty($title))
						return wpseo_replace_vars($title, (array)$this->category);
					return $wpseo_front->get_title_from_options('title-tax-' . $this->category->taxonomy, $this->category);
				} elseif ($this->is_location) {
					$title = trim(WPSEO_Taxonomy_Meta::get_term_meta($this->location, $this->location->taxonomy, 'title'));
	
					if (!empty($title))
						return wpseo_replace_vars($title, (array)$this->location);
					return $wpseo_front->get_title_from_options('title-tax-' . $this->location->taxonomy, $this->location);
				} elseif ($this->is_tag) {
					$title = trim(WPSEO_Taxonomy_Meta::get_term_meta($this->tag, $this->tag->taxonomy, 'title'));
	
					if (!empty($title))
						return wpseo_replace_vars($title, (array)$this->tag);
					return $wpseo_front->get_title_from_options('title-tax-' . $this->tag->taxonomy, $this->tag);
				} elseif ($this->is_home) {
					//$page = get_post($w2dc_instance->index_page_id);
					//return $wpseo_front->get_title_from_options('title-' . W2DC_POST_TYPE, (array) $page);
					return $wpseo_front->get_content_title();
				}
			} else {
				// Yoast SEO v14.0.0 and newer
	
				if ($this->is_single) {
					global $post;
					$saved_page = $post;
					$post = $this->object_single->post;
						
					$yoast_title = WPSEO_Meta::get_value('title', $this->object_single->post->ID);
					if (!$yoast_title) {
						$yoast_title = WPSEO_Options::get('title-' . W2DC_POST_TYPE);
					}
					$title = wpseo_replace_vars($yoast_title, (array)$this->object_single->post);
						
					$post = $saved_page;
						
					return $title;
				} elseif ($this->is_category) {
					$yoast_title = YoastSEO()->helpers->taxonomy->get_term_meta($this->category);
						
					if (!empty($yoast_title['wpseo_title'])) {
						return wpseo_replace_vars($yoast_title['wpseo_title'], $this->category);
					} else {
						return wpseo_replace_vars(WPSEO_Options::get('title-tax-' . $this->category->taxonomy), $this->category);
					}
				} elseif ($this->is_location) {
					$yoast_title = YoastSEO()->helpers->taxonomy->get_term_meta($this->location);
						
					if (!empty($yoast_title['wpseo_title'])) {
						return wpseo_replace_vars($yoast_title['wpseo_title'], $this->location);
					} else {
						return wpseo_replace_vars(WPSEO_Options::get('title-tax-' . $this->location->taxonomy), $this->location);
					}
				} elseif ($this->is_tag) {
					$yoast_title = YoastSEO()->helpers->taxonomy->get_term_meta($this->tag);
						
					if (!empty($yoast_title['wpseo_title'])) {
						return wpseo_replace_vars($yoast_title['wpseo_title'], $this->tag);
					} else {
						return wpseo_replace_vars(WPSEO_Options::get('title-tax-' . $this->tag->taxonomy), $this->tag);
					}
				} elseif ($this->is_home) {
					return $title;
				}
			}
	
			if ($this->getPageTitle()) {
				$title = esc_html(strip_tags(stripslashes($this->getPageTitle()))) . ' ';
			}
			return $title . wpseo_replace_vars('%%sep%% %%sitename%%', array());
		} else {
			$directory_title = '';
			if ($this->getPageTitle()) {
				$directory_title = $this->getPageTitle() . ' ' . $separator . ' ';
			}
			if (w2dc_get_wpml_dependent_option('w2dc_directory_title')) {
				$directory_title .= w2dc_get_wpml_dependent_option('w2dc_directory_title');
			} else {
				$directory_title .= get_option('blogname');
			}
			return $directory_title;
		}
	
		return $title;
	}
	
	// rewrite canonical URL
	public function rel_canonical_with_custom_tag_override() {
		echo '<link rel="canonical" href="' . get_permalink($this->object_single->post->ID) . '" />
';
	}
	
	// Adding the Open Graph in the Language Attributes
	public function add_opengraph_doctype($output) {
		return $output . ' xmlns:og="http://opengraphprotocol.org/schema/" xmlns:fb="http://www.facebook.com/2008/fbml"';
	}
	
	// Temporarily change global $post variable in head
	public function change_global_post() {
		global $post;
		$this->head_post = $post;
		$post = $this->object_single->post;
	}
	public function back_global_post() {
		global $post;
		$post = $this->head_post;
	}
	
	// Lets add Open Graph Meta Info
	public function insert_fb_in_head() {
		echo '<meta property="og:type" content="article" data-w2dc-og-meta="true" />
';
		echo '<meta property="og:title" content="' . $this->og_title() . '" />
';
	
		echo '<meta property="og:description" content="' . $this->og_description() . '" />
';
		echo '<meta property="og:url" content="' . $this->og_url() . '" />
';
		echo '<meta property="og:site_name" content="' . $this->og_site_name() . '" />
';
		if ($thumbnail_src = $this->og_image()) {
			echo '<meta property="og:image" content="' . esc_attr($thumbnail_src) . '" />
';
		}
	
		add_filter('wpseo_opengraph_title', array($this, 'og_title'), 10, 2);
		add_filter('wpseo_opengraph_desc', array($this, 'og_description'), 10, 2);
		add_filter('wpseo_opengraph_url', array($this, 'og_url'), 10, 2);
		add_filter('wpseo_opengraph_image', array($this, 'og_image'), 10, 2);
		add_filter('wpseo_opengraph_site_name', array($this, 'og_site_name'), 10, 2);
	}
	
	public function og_title() {
		return esc_attr($this->object_single->title()) . ' - ' . w2dc_get_wpml_dependent_option('w2dc_directory_title');
	}
	
	public function og_description() {
		if ($this->object_single->post->post_excerpt) {
			$excerpt = $this->object_single->post->post_excerpt;
		} else {
			$excerpt = $this->object_single->getExcerptFromContent();
		}
	
		return esc_attr($excerpt);
	}
	
	public function og_url() {
		return get_permalink($this->object_single->post->ID);
	}
	
	public function og_site_name() {
		return w2dc_get_wpml_dependent_option('w2dc_directory_title');
	}
	
	public function og_image() {
		return $this->object_single->get_logo_url();
	}

	public function display() {
		$output =  w2dc_renderTemplate($this->template, $this->template_args, true);
		wp_reset_postdata();

		return $output;
	}
}

add_action('init', 'w2dc_handle_wpcf7');
function w2dc_handle_wpcf7() {
	if (defined('WPCF7_VERSION')) {
		if (get_option('w2dc_listing_contact_form') && defined('WPCF7_VERSION') && w2dc_get_wpml_dependent_option('w2dc_listing_contact_form_7')) {
			add_filter('wpcf7_mail_components', 'w2dc_wpcf7_handle_email', 10, 2);
		}
			
		function w2dc_wpcf7_handle_email($WPCF7_components, $WPCF7_currentform) {
			if (isset($_REQUEST['listing_id'])) {
				$post = get_post($_REQUEST['listing_id']);
	
				$mail = $WPCF7_currentform->prop('mail');
				// DO not touch mail_2
				if ($mail['recipient'] == $WPCF7_components['recipient']) {
					if ($post && isset($_POST['_wpcf7']) && preg_match_all('/'.get_shortcode_regex().'/s', w2dc_get_wpml_dependent_option('w2dc_listing_contact_form_7'), $matches)) {
						foreach ($matches[2] AS $key=>$shortcode) {
							if ($shortcode == 'contact-form-7') {
								if ($attrs = shortcode_parse_atts($matches[3][$key])) {
									if (isset($attrs['id']) && $attrs['id'] == $_POST['_wpcf7']) {
										$contact_email = null;
										if (get_option('w2dc_custom_contact_email') && ($listing = w2dc_getListing($post)) && $listing->contact_email) {
											$contact_email = $listing->contact_email;
										} elseif (($listing_owner = get_userdata($post->post_author)) && $listing_owner->user_email) {
											$contact_email = $listing_owner->user_email;
										}
										if ($contact_email)
											$WPCF7_components['recipient'] = $contact_email;
									}
								}
							}
						}
					}
				}
			}
			return $WPCF7_components;
		}
	}
}

?>