<?php 

class w2dc_frontend_controller {
	public $args = array();
	public $query;
	public $page_title;
	public $template;
	public $listings = array();
	public $search_form;
	public $map;
	public $paginator;
	public $breadcrumbs = array();
	public $base_url;
	public $messages = array();
	public $hash = null;
	public $levels_ids;
	public $do_initial_load = true;
	public $request_by = 'frontend_controller';
	public $template_args = array();

	public function __construct($args = array()) {
		apply_filters('w2dc_frontend_controller_construct', $this);
		
		$this->template_args = array('frontend_controller' => $this);
	}
	
	public function add_template_args($args = array()) {
		$this->template_args += $args;
	}
	
	public function init($attrs = array()) {
		$this->args['logo_animation_effect'] = get_option('w2dc_logo_animation_effect');

		if (!$this->hash) {
			if (isset($attrs['uid']) && $attrs['uid']) {
				$this->hash = md5($attrs['uid']);
			} else {
				$this->hash = md5(get_class($this).serialize($attrs));
			}
		}
	}

	public function processQuery($load_map = true, $map_args = array()) {
		// this is special construction,
		// this needs when we order by any postmeta field, this adds listings to the list with "empty" fields
		if (($this->getQueryVars('orderby') == 'meta_value_num' || $this->getQueryVars('orderby') == 'meta_value') && ($this->getQueryVars('meta_key') != '_order_date')) {
			$args = $this->getQueryVars();

			// there is strange thing - WP adds `taxonomy` and `term_id` args to the root of query vars array
			// this may cause problems
			unset($args['taxonomy']);
			unset($args['term_id']);
			if (empty($args['s'])) {
				unset($args['s']);
			}
			
			$original_posts_per_page = $args['posts_per_page'];

			$ordered_posts_ids = get_posts(array_merge($args, array('fields' => 'ids', 'nopaging' => true)));
			//var_dump($ordered_posts_ids);
			$ordered_max_num_pages = ceil(count($ordered_posts_ids)/$original_posts_per_page) - (int) $ordered_posts_ids;

			$args['paged'] = $args['paged'] - $ordered_max_num_pages;
			$args['orderby'] = 'meta_value_num';
			$args['meta_key'] = '_order_date';
			$args['order'] = 'DESC';
			$args['posts_per_page'] = $original_posts_per_page - $this->query->post_count;
			$all_posts_ids = get_posts(array_merge($args, array('fields' => 'ids', 'nopaging' => true)));
			$all_posts_count = count($all_posts_ids);
			//var_dump($all_posts_count);

			// commented this line, because it gives duplicates on rating_order for example,
			// when rated listings already have been shown, on the next 'Show more listings' step it just gives empty query - so it does not include post__not_in with shown listings and just gives first query
			//if ($this->query->found_posts) {
				$args['post__not_in'] = array_map('intval', $ordered_posts_ids);
				if (!empty($args['post__in']) && is_array($args['post__in'])) {
					$args['post__in'] = array_diff($args['post__in'], $args['post__not_in']);
					if (!$args['post__in']) {
						$args['posts_per_page'] = 0;
					}
				}
			//}

			$unordered_query = new WP_Query($args);
			//var_dump($args);

			//var_dump($unordered_query->request);
			//var_dump($this->query->request);

			if ($args['posts_per_page']) {
				$this->query->posts = array_merge($this->query->posts, $unordered_query->posts);
			}

			$this->query->post_count = count($this->query->posts);
			$this->query->found_posts = $all_posts_count;
			$this->query->max_num_pages = ceil($all_posts_count/$original_posts_per_page);
		}

		if ($load_map) {
			if (!isset($map_args['map_markers_is_limit']))
				$map_args['map_markers_is_limit'] = get_option('w2dc_map_markers_is_limit');
			$this->map = new w2dc_maps($map_args, $this->request_by);
			$this->map->setUniqueId($this->hash);
			
			if (!$map_args['map_markers_is_limit'] && !$this->map->is_ajax_loading()) {
				$this->collectAllLocations();
			}
		}

		while ($this->query->have_posts()) {
			$this->query->the_post();

			$listing = new w2dc_listing;
			$listing->loadListingFromPost(get_post());
			$listing->logo_animation_effect = (isset($this->args['logo_animation_effect'])) ? $this->args['logo_animation_effect'] : get_option('w2dc_logo_animation_effect');

			if ($load_map && $map_args['map_markers_is_limit'] && !$this->map->is_ajax_loading()) {
				$this->map->collectLocations($listing);
			}
			
			$this->listings[get_the_ID()] = $listing;
		}
		
		global $w2dc_address_locations, $w2dc_tax_terms_locations;
		// empty this global arrays - there may be some maps on one page with different arguments
		$w2dc_address_locations = array();
		$w2dc_tax_terms_locations = array();

		// this is reset is really required after the loop ends 
		wp_reset_postdata();
		
		remove_filter('posts_join', 'w2dc_join_levels');
		remove_filter('posts_orderby', 'w2dc_orderby_levels', 1);
		remove_filter('get_meta_sql', 'w2dc_add_null_values');
	}
	
	public function collectAllLocations() {
		$args = $this->getQueryVars();
		
		unset($args['orderby']);
		unset($args['order']);
		$args['nopaging'] = 1;
		
		$unlimited_query = new WP_Query($args);
		
		while ($unlimited_query->have_posts()) {
			$unlimited_query->the_post();
		
			$listing = new w2dc_listing;
			$listing->loadListingFromPost(get_post());
		
			$this->map->collectLocations($listing);
		}
	}
	
	public function getQueryVars($var = null) {
		if (is_null($var)) {
			return $this->query->query_vars;
		} else {
			if (isset($this->query->query_vars[$var])) {
				return $this->query->query_vars[$var];
			}
		}
		return false;
	}
	
	public function getPageTitle() {
		return $this->page_title;
	}

	public function addBreadCrumbs($breadcrumb) {
		if (is_array($breadcrumb)) {
			foreach ($breadcrumb AS $_breadcrumb) {
				$this->addBreadCrumbs($_breadcrumb);
			}
		} else {
			if (is_object($breadcrumb) && get_class($breadcrumb) == 'w2dc_breadcrumb') {
				$this->breadcrumbs[] = $breadcrumb;
			} else {
				$this->breadcrumbs[] = new w2dc_breadcrumb($breadcrumb);
			}
		}
	}
	
	public function getBreadCrumbsLinks() {
		$links = array();
		
		$breadcrumbs_process = $this->breadcrumbs;
		if (!get_option('w2dc_hide_home_link_breadcrumb')) {
			array_unshift($breadcrumbs_process, new w2dc_breadcrumb(esc_html__('Home', 'W2DC'), w2dc_directoryUrl()));
		}
		
		foreach ($breadcrumbs_process AS $key=>$breadcrumb) {
			$title = '';
			if ($breadcrumb->title) {
				$title = 'title="' . $breadcrumb->title . '"';
			}
			
			$links[] = '<a href="' . $breadcrumb->url . '" ' . $title . '>' . $breadcrumb->name . '</a>';
		}
		
		return $links;
	}
	
	public function printBreadCrumbs($separator = ' » ') {
		
		do_action("w2dc_print_breadcrumbs", $this);
		
		if ($breadcrumbs_process = $this->breadcrumbs) {
			$do_schema = false;
			if (count($this->breadcrumbs) > 1) {
				$do_schema = true;
			}
			
			$do_schema = apply_filters('w2dc_do_schema', $do_schema);
			
			if ($do_schema) {
				echo '<ol class="w2dc-breadcrumbs" itemscope itemtype="http://schema.org/BreadcrumbList">';
			} else {
				echo '<ol class="w2dc-breadcrumbs">';
			}
			
			if (!get_option('w2dc_hide_home_link_breadcrumb')) {
				array_unshift($breadcrumbs_process, new w2dc_breadcrumb(esc_html__('Home', 'W2DC'), w2dc_directoryUrl()));
			}
			
			$counter = 0;
			foreach ($breadcrumbs_process AS $key=>$breadcrumb) {
				$title = '';
				if ($breadcrumb->title) {
					$title = 'title="' . $breadcrumb->title . '"';
				}
				
				if ($breadcrumb->url) {
					if ($do_schema) {
						$counter++;
						echo '<li itemprop="itemListElement" itemscope="" itemtype="http://schema.org/ListItem"><a href="' . $breadcrumb->url . '" itemprop="item" ' . $title . '><span itemprop="name">' . $breadcrumb->name . '</span><meta itemprop="position" content="' . $counter . '" /></a></li>';
					} else {
						echo '<li><a href="' . $breadcrumb->url . '" ' . $title . '>' . $breadcrumb->name . '</a></li>';
					}
				} else {
					echo '<li>' . $breadcrumb->name . '</li>';
				}
				
				if ($key+1 < count($breadcrumbs_process)) {
					echo $separator;
				}
			}
			echo '</ol>';
		}
	}

	public function getBaseUrl() {
		return $this->base_url;
	}
	
	public function where_levels_ids($where = '') {
		if ($this->levels_ids)
			$where .= " AND (w2dc_levels.id IN (" . implode(',', $this->levels_ids) . "))";
		return $where;
	}
	
	public function getListingsDirectory() {
		global $w2dc_instance;
		
		if (isset($this->args['directories']) && !empty($this->args['directories'])) {
			if (is_object($this->args['directories'])) {
				return $this->args['directories'];
			} elseif (is_string($this->args['directories'])) {
				if ($directories_ids = array_filter(explode(',', $this->args['directories']), 'trim')) {
					if (count($directories_ids) == 1 && ($directory = $w2dc_instance->directories->getDirectoryById($directories_ids[0]))) {
						return $directory;
					}
				}
			}
		}
		
		return $w2dc_instance->current_directory;
	}
	
	public function getListingClasses() {
		$classes = array();
		$listing = $this->listings[get_the_ID()];
		
		$classes[] = 'w2dc-listing-level-' . $listing->level->id;
		
		if ($listing->level->featured) {
			$classes[] = 'w2dc-featured';
		}
		if ($listing->level->sticky) {
			$classes[] = 'w2dc-sticky';
		}
		if (!empty($this->args['summary_on_logo_hover'])) {
			$classes[] = 'w2dc-summary-on-logo-hover';
		}
		if (!empty($this->args['hide_content'])) {
			$classes[] = 'w2dc-hidden-content';
		}
		if ($listing->isMap()) {
			foreach ($listing->locations AS $location) {
				$classes[] = 'w2dc-listing-has-location-'.$location->id;
			}
		}
		
		$classes = apply_filters("w2dc_listing_classes", $classes, $listing);
		
		return implode(" ", $classes);
	}
	
	public function getListingsBlockClasses() {
		$classes[] = "w2dc-container-fluid";
		$classes[] = "w2dc-listings-block";
		$classes[] = "w2dc-mobile-listings-grid-" . get_option('w2dc_mobile_listings_grid_columns');
		$views_cookie = false;
		if ($this->args['show_views_switcher'] && isset($_COOKIE['w2dc_listings_view_'.$this->hash])) {
			$views_cookie = $_COOKIE['w2dc_listings_view_'.$this->hash];
		}
		if (($this->args['listings_view_type'] == 'grid' && !$views_cookie) || ($views_cookie == 'grid')) {
			$classes[] = "w2dc-listings-grid";
			$classes[] = "w2dc-listings-grid-" . $this->args['listings_view_grid_columns'];
		} else {
			$classes[] = "w2dc-listings-list-view";
		}
		
		$classes = apply_filters("w2dc_listings_block_classes", $classes, $this);
	
		return implode(" ", $classes);
	}
	
	public function printVisibleSearchParams() {
		if (apply_filters('w2dc_print_visible_search_params', true)) {
			if (w2dc_getValue($this->args, 'include_get_params') && w2dc_getValue($_REQUEST, 'w2dc_action') == 'search') {
				do_action('w2dc_visible_search_params', $this);
			}
		}
	}
	
	public function getShortcodeController() {
		return w2dc_getShortcodeController();
	}
	
	/**
	 * posts_per_page does not work in WP_Query when we search by name='slug' parameter,
	 * we have to use this hack
	 * 
	 * @return string
	 */
	public function findOnlyOnePost() {
		return 'LIMIT 0, 1';
	}
	
	public function display() {
		$output =  w2dc_renderTemplate($this->template, $this->template_args, true);
		wp_reset_postdata();
	
		return $output;
	}
}

/**
 * join levels_relationships and levels tables into the query
 * 
 * */
function w2dc_join_levels($join = '') {
	global $wpdb;

	$join .= " LEFT JOIN {$wpdb->w2dc_levels_relationships} AS w2dc_lr ON w2dc_lr.post_id = {$wpdb->posts}.ID ";
	$join .= " LEFT JOIN {$wpdb->w2dc_levels} AS w2dc_levels ON w2dc_levels.id = w2dc_lr.level_id ";

	return $join;
}

/**
 * sticky and featured listings in the first order
 * 
 */
function w2dc_orderby_levels($orderby = '') {
	$orderby_array[] = " w2dc_levels.sticky DESC";
	$orderby_array[] = "w2dc_levels.featured DESC";
	$orderby_array[] = $orderby;
	
	$orderby_array = apply_filters('w2dc_orderby_levels', $orderby_array, $orderby);
	
	return implode(', ', $orderby_array);
}

/**
 * sticky and featured listings in the first order
 * 
 */
function w2dc_where_sticky_featured($where = '') {
	$where .= " AND (w2dc_levels.sticky=1 OR w2dc_levels.featured=1)";
	return $where;
}

/**
 * Listings with empty values must be sorted as well
 * 
 */
function w2dc_add_null_values($clauses) {
	$clauses['where'] = preg_replace("/wp_postmeta\.meta_key = '_content_field_([0-9]+)'/", "(wp_postmeta.meta_key = '_content_field_$1' OR wp_postmeta.meta_value IS NULL)", $clauses['where']);
	return $clauses;
}


add_filter('w2dc_order_args', 'w2dc_order_listings', 10, 3);
function w2dc_order_listings($order_args = array(), $defaults = array(), $include_GET_params = true) {
	global $w2dc_instance;
	
	// adapted for Relevanssi
	if (w2dc_is_relevanssi_search($defaults)) {
		return $order_args;
	}

	if ($include_GET_params && isset($_GET['order_by']) && $_GET['order_by']) {
		$order_by = $_GET['order_by'];
		$order = w2dc_getValue($_GET, 'order', 'ASC');
	} else {
		if (isset($defaults['order_by']) && $defaults['order_by']) {
			$order_by = $defaults['order_by'];
			$order = w2dc_getValue($defaults, 'order', 'ASC');
		} else {
			$order_by = 'post_date';
			$order = 'DESC';
		}
	}
	
	// search by keyword - do not randomize it
	if (w2dc_getValue($_REQUEST, 'what_search') && ($order_by == 'rand' || $order_by == 'random')) {
		return $order_args;
	}

	$order_args['orderby'] = $order_by;
	$order_args['order'] = $order;

	if ($order_by == 'rand' || $order_by == 'random') {
		if (get_option('w2dc_orderby_sticky_featured')) {
			add_filter('posts_join', 'w2dc_join_levels');
			add_filter('posts_orderby', 'w2dc_orderby_levels', 1);
		}
		$order_args['orderby'] = 'rand';
	}

	if ($order_by == 'title') {
		$order_args['orderby'] = array('title' => $order_args['order'], 'meta_value_num' => 'ASC');
		$order_args['meta_key'] = '_order_date';
		if (get_option('w2dc_orderby_sticky_featured')) {
			add_filter('posts_join', 'w2dc_join_levels');
			add_filter('posts_orderby', 'w2dc_orderby_levels', 1);
		}
	} elseif ($order_by == 'post_date' || get_option('w2dc_orderby_sticky_featured')) {
		// Do not affect levels weights when already ordering by posts IDs
		if (!isset($order_args['orderby']) || $order_args['orderby'] != 'post__in') {
			add_filter('posts_join', 'w2dc_join_levels');
			add_filter('posts_orderby', 'w2dc_orderby_levels', 1);
			add_filter('get_meta_sql', 'w2dc_add_null_values');
		}

		if ($order_by == 'post_date') {
			$w2dc_instance->order_by_date = true;
			// First of all order by _order_date parameter
			$order_args['orderby'] = 'meta_value_num';
			$order_args['meta_key'] = '_order_date';
		} else
			$order_args = array_merge($order_args, $w2dc_instance->content_fields->getOrderParams($defaults));
	} else {
		$order_args = array_merge($order_args, $w2dc_instance->content_fields->getOrderParams($defaults));
	}

	return $order_args;
}

/**
 * order listings by title as the second ordering
 */
add_filter('w2dc_order_args', 'w2dc_the_second_order_listings', 102, 3);
function w2dc_the_second_order_listings($order_args = array(), $defaults = array(), $include_GET_params = true) {
	if (isset($order_args['orderby'])) {
		if (is_array($order_args['orderby']) && count($order_args['orderby']) == 1) {
			$order_args['orderby'] = array(
					array_shift($order_args['orderby']) => $order_args['order'],
					'title' => 'ASC',
			);
		} elseif (!is_array($order_args['orderby']) && $order_args['orderby'] != 'meta_value_num') {
			$order_args['orderby'] = array(
					$order_args['orderby'] => $order_args['order'],
					'title' => 'ASC',
			);
		}
	}
	
	return $order_args;
}

class w2dc_query_search extends WP_Query {
	function __parse_search($q) {
		$x = $this->parse_search($q);
		return $x;
	}
}
add_filter('posts_clauses', 'w2dc_posts_clauses', 10, 2);
/*
 * combine search by keyword in categories/tags and search by simple text keyword,
 * OR operator is used by default,
 * AND is used only when we need to get results exactly from specific categories/tags
 * 
 * look at retrieve_search_args() in search_fields.php
 * 
 */
function w2dc_posts_clauses($clauses, $q) {
	if ($title = $q->get('_meta_or_title')) {
		$meta_or_title_relation = 'OR';
		if ($q->get('_meta_or_title_relation')) {
			$meta_or_title_relation = $q->get('_meta_or_title_relation');
		}
		
		$tax_query_vars = array();
		if (!empty($q->query_vars['tax_query'])) {
			$tax_query_vars = $q->query_vars['tax_query'];
		}
		if (isset($tax_query_vars[0]['taxonomy']) && in_array($tax_query_vars[0]['taxonomy'], array(W2DC_CATEGORIES_TAX, W2DC_TAGS_TAX))) {
			$tq_AND = new WP_Tax_Query($tax_query_vars);
			
			$tax_query_vars['relation'] = $meta_or_title_relation;
			$tq_OR = new WP_Tax_Query($tax_query_vars);

			$qu['s'] = $title;
			$w2dc_query_search = new w2dc_query_search;
	
			global $wpdb;
			$tc_AND = $tq_AND->get_sql($wpdb->posts, 'ID');
			$tc_OR = $tq_OR->get_sql($wpdb->posts, 'ID');

			if ($tc_AND['where'] && ($search_sql = $w2dc_query_search->__parse_search($qu))) {
				$clauses['where'] = str_ireplace( 
					$search_sql, 
					' ', 
					$clauses['where'] 
				);
				$clauses['where'] = str_ireplace( 
					$tc_AND['where'], 
					' ', 
					$clauses['where'] 
				);
				$clauses['where'] .= sprintf( 
					" AND ( ( 1=1 %s ) " . $meta_or_title_relation . " ( 1=1 %s ) ) ",
					$tc_OR['where'],
					$search_sql
				);
			}
		}
    }
    return $clauses;
}

function w2dc_what_search($args, $defaults = array(), $include_GET_params = true) {
	if ($include_GET_params) {
		$args['s'] = w2dc_getValue($_GET, 'what_search', w2dc_getValue($defaults, 'what_search'));
	} else {
		$args['s'] = w2dc_getValue($defaults, 'what_search');
	}
	
	$args['s'] = stripslashes($args['s']);
	
	$args['s'] = apply_filters('w2dc_search_param_what_search', $args['s']);

	// 's' parameter must be removed when it is empty, otherwise it may cause WP_query->is_search = true
	if (empty($args['s'])) {
		unset($args['s']);
	}

	return $args;
}
add_filter('w2dc_search_args', 'w2dc_what_search', 10, 3);

function w2dc_address($args, $defaults = array(), $include_GET_params = true) {
	global $wpdb, $w2dc_address_locations;

	if ($include_GET_params) {
		$address = w2dc_getValue($_GET, 'address', w2dc_getValue($defaults, 'address'));
		$search_location = w2dc_getValue($_GET, 'location_id', w2dc_getValue($defaults, 'location_id'));
	} else {
		$search_location = w2dc_getValue($defaults, 'location_id');
		$address = w2dc_getValue($defaults, 'address');
	}
	
	$search_location = apply_filters('w2dc_search_param_location_id', $search_location);
	$address = apply_filters('w2dc_search_param_address', $address);
	
	$where_sql_array = array();
	if ($search_location && is_numeric($search_location)) {
		$term_ids = get_terms(W2DC_LOCATIONS_TAX, array('child_of' => $search_location, 'fields' => 'ids', 'hide_empty' => false));
		$term_ids[] = $search_location;
		$where_sql_array[] = "(location_id IN (" . implode(', ', $term_ids) . "))";
	}
	
	if ($address) {
		$where_sql_array[] = $wpdb->prepare("(address_line_1 LIKE '%%%s%%' OR address_line_2 LIKE '%%%s%%' OR zip_or_postal_index LIKE '%%%s%%')", $address, $address, $address);
		
		// Search keyword in locations terms
		$t_args = array(
				'taxonomy'      => array(W2DC_LOCATIONS_TAX),
				'orderby'       => 'id',
				'order'         => 'ASC',
				'hide_empty'    => true,
				'fields'        => 'tt_ids',
				'name__like'    => $address
		);
		$address_locations = get_terms($t_args);

		foreach ($address_locations AS $address_location) {
			$term_ids = get_terms(W2DC_LOCATIONS_TAX, array('child_of' => $address_location, 'fields' => 'ids', 'hide_empty' => false));
			$term_ids[] = $address_location;
			$where_sql_array[] = "(location_id IN (" . implode(', ', $term_ids) . "))";
		}
	}

	if ($where_sql_array) {
		$results = $wpdb->get_results("SELECT id, post_id FROM {$wpdb->w2dc_locations_relationships} WHERE " . implode(' OR ', $where_sql_array), ARRAY_A);
		$post_ids = array();
		foreach ($results AS $row) {
			$post_ids[] = $row['post_id'];
			$w2dc_address_locations[] = $row['id'];
		}
		if ($post_ids) {
			$args['post__in'] = $post_ids;
		} else {
			// Do not show any listings
			$args['post__in'] = array(0);
		}	
	}
	return $args;
}
add_filter('w2dc_search_args', 'w2dc_address', 10, 3);

function w2dc_visible_search_params_keyword($frontend_controller) {
	if ($keyword = w2dc_getValue($_REQUEST, 'what_search')) {
		if (($categories = array_filter(explode(',', w2dc_getValue($_REQUEST, 'categories')), 'trim'))) {
			foreach ($categories AS $category_id) {
				if ($category = get_term($category_id, W2DC_CATEGORIES_TAX)) {
					$keyword = trim(str_ireplace(htmlspecialchars_decode($category->name), '', $keyword));
				}
			}
		}
		
		if ($keyword) {
			$keywords_url = remove_query_arg('what_search', $frontend_controller->base_url);
			echo w2dc_visibleSearchParam($keyword, $keywords_url);
		}
	}
}
add_action('w2dc_visible_search_params', 'w2dc_visible_search_params_keyword');

function w2dc_visible_search_params_categories($frontend_controller) {
	if ($categories = w2dc_getValue($_REQUEST, 'categories')) {
		if (($categories = array_filter(explode(',', $categories), 'trim'))) {
			foreach ($categories AS $key=>$category_id) {
				if ($category = get_term($category_id, W2DC_CATEGORIES_TAX)) {
					$url = remove_query_arg('categories', $frontend_controller->base_url);
					if (count($categories) > 1) {
						$categories_array = $categories;
						unset($categories_array[$key]);
						$url = add_query_arg('categories', implode(",", $categories_array), $url);
					}
					if (($keyword = w2dc_getValue($_REQUEST, 'what_search')) && $keyword == $category->name) {
						$url = remove_query_arg('what_search', $url);
					}
					echo w2dc_visibleSearchParam($category->name, $url);
				}
			}
		}
	}
}
add_action('w2dc_visible_search_params', 'w2dc_visible_search_params_categories');

function w2dc_visible_search_params_location_id($frontend_controller) {
	if ($location_id = w2dc_getValue($_REQUEST, 'location_id')) {
		if ($location = get_term($location_id, W2DC_LOCATIONS_TAX)) {
			$url = remove_query_arg('location_id', $frontend_controller->base_url);
			echo w2dc_visibleSearchParam($location->name, $url);
		}
	}
}
add_action('w2dc_visible_search_params', 'w2dc_visible_search_params_location_id');

function w2dc_visible_search_params_address($frontend_controller) {
	if ($address = w2dc_getValue($_REQUEST, 'address')) {
		if ($location_id = w2dc_getValue($_REQUEST, 'location_id')) {
			if ($location = get_term($location_id, W2DC_LOCATIONS_TAX)) {
				$address = trim(str_ireplace(htmlspecialchars_decode($location->name), '', $address));
			}
		}
		
		if ($address) {
			$url = remove_query_arg('address', $frontend_controller->base_url);
			$url = remove_query_arg('radius', $url);
			echo w2dc_visibleSearchParam($address, $url);
			
			if ($radius = w2dc_getValue($_REQUEST, 'radius')) {
				$url = remove_query_arg('radius', $frontend_controller->base_url);
				if (get_option('w2dc_miles_kilometers_in_search') == 'miles') {
					$dimension_string = _n("radius %d mile", "radius %d miles", $radius, "W2DC");
				} else {
					$dimension_string = _n("radius %d kilometer", "radius %d kilometers", $radius, "W2DC");
				}
				echo w2dc_visibleSearchParam(sprintf($dimension_string, $radius), $url);
			}
		}
	}
}
add_action('w2dc_visible_search_params', 'w2dc_visible_search_params_address');

// Exclude a part of keyword string equal to category name
function w2dc_keywordInCategorySearch($keyword) {
	if (w2dc_getValue($_REQUEST, 'w2dc_action') == 'search' && ($categories = array_filter(explode(',', w2dc_getValue($_REQUEST, 'categories')), 'trim')) && count($categories) == 1) {
		if ($category = get_term(array_pop($categories), W2DC_CATEGORIES_TAX)) {
			$keyword = trim(str_ireplace(htmlspecialchars_decode($category->name), '', $keyword));
		}
	}
	return $keyword;
}
add_filter('w2dc_search_param_what_search', 'w2dc_keywordInCategorySearch');

// Exclude a part of address string equal to location name
function w2dc_addressInLocationSearch($address) {
	if (w2dc_getValue($_REQUEST, 'w2dc_action') == 'search' && ($location_id = array_filter(explode(',', w2dc_getValue($_REQUEST, 'location_id')), 'trim')) && count($location_id) == 1) {
		if ($location = get_term(array_pop($location_id), W2DC_LOCATIONS_TAX)) {
			$address = trim(str_ireplace(htmlspecialchars_decode($location->name), '', $address));
		}
	}
	return $address;
}
add_filter('w2dc_search_param_address', 'w2dc_addressInLocationSearch');

function w2dc_base_url_args($args) {
	if (isset($_REQUEST['w2dc_action']) && $_REQUEST['w2dc_action'] == 'search') {
			$args['w2dc_action'] = 'search';
		if (isset($_REQUEST['what_search']) && $_REQUEST['what_search']) {
			$args['what_search'] = urlencode($_REQUEST['what_search']);
		}
		if (isset($_REQUEST['address']) && $_REQUEST['address']) {
			$args['address'] = urlencode($_REQUEST['address']);
		}
		if (isset($_REQUEST['location_id']) && $_REQUEST['location_id'] && is_numeric($_REQUEST['location_id'])) {
			$args['location_id'] = $_REQUEST['location_id'];
		}
	}

	if (isset($_REQUEST['order_by']) && $_REQUEST['order_by']) {
		$args['order_by'] = $_REQUEST['order_by'];
	}
	if (isset($_REQUEST['order']) && $_REQUEST['order']) {
		$args['order'] = $_REQUEST['order'];
	}

	return $args;
}
add_filter('w2dc_base_url_args', 'w2dc_base_url_args');

function w2dc_related_shortcode_args($shortcode_atts) {
	global $w2dc_instance;
	
	if ((isset($shortcode_atts['directories']) && $shortcode_atts['directories'] == 'related') || (isset($shortcode_atts['related_directory']) && $shortcode_atts['related_directory'])) {
		if ($shortcode_controller = w2dc_getShortcodeController()) {
			if ($shortcode_controller->is_home || $shortcode_controller->is_search || $shortcode_controller->is_category || $shortcode_controller->is_location || $shortcode_controller->is_tag) {
				$shortcode_atts['directories'] = $w2dc_instance->current_directory->id;
			} elseif ($shortcode_controller->is_single) {
				if ($shortcode_controller->is_listing) {
					$listing = $shortcode_controller->listing;
				}
				$shortcode_atts['directories'] = $listing->directory->id;
				$shortcode_atts['post__not_in'] = $listing->post->ID;
			}
		}
	}

	if ((isset($shortcode_atts['categories']) && $shortcode_atts['categories'] == 'related') || (isset($shortcode_atts['related_categories']) && $shortcode_atts['related_categories'])) {
		if ($shortcode_controller = w2dc_getShortcodeController()) {
			if ($shortcode_controller->is_category) {
				$shortcode_atts['categories'] = $shortcode_controller->category->term_id;
			} elseif ($shortcode_controller->is_single) {
				if ($shortcode_controller->is_listing) {
					$listing = $shortcode_controller->listing;
				}
				if ($terms = get_the_terms($listing->post->ID, W2DC_CATEGORIES_TAX)) {
					$terms_ids = array();
					foreach ($terms AS $term)
						$terms_ids[] = $term->term_id;
					$shortcode_atts['categories'] = implode(',', $terms_ids);
				}
				$shortcode_atts['post__not_in'] = $listing->post->ID;
			}
		}
	}

	if ((isset($shortcode_atts['locations']) && $shortcode_atts['locations'] == 'related') || (isset($shortcode_atts['related_locations']) && $shortcode_atts['related_locations'])) {
		if ($shortcode_controller = w2dc_getShortcodeController()) {
			if ($shortcode_controller->is_location) {
				$shortcode_atts['locations'] = $shortcode_controller->location->term_id;
			} elseif ($shortcode_controller->is_single) {
				if ($shortcode_controller->is_listing) {
					$listing = $shortcode_controller->listing;
				}
				if ($terms = get_the_terms($listing->post->ID, W2DC_LOCATIONS_TAX)) {
					$terms_ids = array();
					foreach ($terms AS $term)
						$terms_ids[] = $term->term_id;
					$shortcode_atts['locations'] = implode(',', $terms_ids);
				}
				$shortcode_atts['post__not_in'] = $listing->post->ID;
			}
		}
	}

	if (isset($shortcode_atts['related_tags']) && $shortcode_atts['related_tags']) {
		if ($shortcode_controller = w2dc_getShortcodeController()) {
			if ($shortcode_controller->is_tag) {
				$shortcode_atts['tags'] = $shortcode_controller->tag->term_id;
			} elseif ($shortcode_controller->is_single) {
				if ($shortcode_controller->is_listing) {
					$listing = $shortcode_controller->listing;
				}
				if ($terms = get_the_terms($listing->post->ID, W2DC_TAGS_TAX)) {
					$terms_ids = array();
					foreach ($terms AS $term)
						$terms_ids[] = $term->term_id;
					$shortcode_atts['tags'] = implode(',', $terms_ids);
				}
				$shortcode_atts['post__not_in'] = $listing->post->ID;
			}
		}
	}

	if (isset($shortcode_atts['author']) && $shortcode_atts['author'] === 'related') {
		if ($shortcode_controller = w2dc_getShortcodeController()) {
			if ($shortcode_controller->is_single) {
				if ($shortcode_controller->is_listing) {
					$listing = $shortcode_controller->listing;
				}
				$shortcode_atts['author'] = $listing->post->post_author;
				$shortcode_atts['post__not_in'] = $listing->post->ID;
			}
		} elseif ($user_id = get_the_author_meta('ID')) {
			$shortcode_atts['author'] = $user_id;
		}
	}
	
	if (isset($shortcode_atts['related_listing']) && $shortcode_atts['related_listing']) {
		if ($shortcode_controller = w2dc_getShortcodeController()) {
			if ($shortcode_controller->is_single) {
				if ($shortcode_controller->is_listing) {
					$listing = $shortcode_controller->listing;
					$shortcode_atts['post__in'] = $listing->post->ID;
				}
			}
		}
	}

	return $shortcode_atts;
}
add_filter('w2dc_related_shortcode_args', 'w2dc_related_shortcode_args');

function w2dc_set_directory_args($args, $directories_ids = array()) {
	global $w2dc_instance;
	
	if ($w2dc_instance->directories->isMultiDirectory()) {
		if (!isset($args['meta_query']))
			$args['meta_query'] = array();
	
		$args['meta_query'] = array_merge($args['meta_query'], array(
				array(
						'key' => '_directory_id',
						'value' => $directories_ids,
						'compare' => 'IN',
				)
		));
	}

	return $args;
}


?>