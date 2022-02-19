<?php

function c4codes_enqueu_styles()
{
    wp_enqueue_style( 'bootstrap', get_stylesheet_directory_uri().'/assets/vendor/bootstrap/css/bootstrap.min.css' );
    wp_enqueue_style( 'icons', get_stylesheet_directory_uri().'/assets/vendor/icons/bootstrap-icons.css' );
    wp_enqueue_style( 'stylesheet', get_stylesheet_directory_uri().'/style.css' );
}
add_action( 'wp_enqueue_scripts', 'c4codes_enqueu_styles' );



function c4codes_enqueue_scripts()
{

    // wp_enqueue_script( 'jquery');
    wp_register_script('bootstrap-script', get_template_directory_uri().'/assets/vendor/bootstrap/js/bootstrap.bundle.min.js','','1.1', true);
    wp_enqueue_script('bootstrap-script');

  
    wp_register_script( 'main-js', get_template_directory_uri().'/assets/js/main.js', '','1.2',true );
    wp_enqueue_script( 'main-js');
}

add_action('wp_enqueue_scripts', 'c4codes_enqueue_scripts');

add_theme_support('post-thumbnails');
add_theme_support('admin-bar');
add_theme_support('title-tag');
// add_theme_support('menus');

//Register menus
register_nav_menus( array('top'=>'Header menu', 'bottom1'=>'Footer menu') );


//Register widgets
if ( function_exists('register_sidebar') )
    register_sidebar(array(
        'name' => 'Footer Widget1',
        'before_widget' => '<div class="col-md-4 py-5">',
        'after_widget' => '</div>',
        'before_title' => '<h3>',
        'after_title' => '</h3>',
    ));

    if ( function_exists('register_sidebar') )
    register_sidebar(array(
        'name' => 'Footer Widget2',
        'before_widget' => '<div class="col-md-4 py-5 d-flex flex-column align-items-center">',
        'after_widget' => '</div>',
        'before_title' => '<h3>',
        'after_title' => '</h3>',
    ));

    if(function_exists('register_sidebar'))
    register_sidebar( array(
        'name' => 'Footer Widget3 ',
        'before_widget'=> '<div class="col-md-4 py-5 d-flex flex-column align-items-center">',
        'after_widget'=> '</div>',
        'before_title'=>'<h3>',
        'after_title'=> '</h3>',
    ) );

    if(function_exists('register_sidebar'))
    register_sidebar( array(
        'name'=>'Aside Widget',
        'before_widget'=>'<div class="aside-widget p-3">',
        'after_widget'=>'</div>',
        'before_title'=>'<h3>',
        'after_title'=>'</h3>',
    ) );