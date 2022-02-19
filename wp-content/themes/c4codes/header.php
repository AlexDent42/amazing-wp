<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- <link rel="stylesheet" href="assets/vendor/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="assets/vendor/icons/bootstrap-icons.css">
    <link rel="stylesheet" href="style.css"> -->
    
    <?php wp_head();?>
    
</head>
<body>
    <header class="c4codes-header-top fixed-top">
        <div class="container">
      
            <nav class="navbar navbar-expand-lg">
                <div class="container-fluid">
                
                  <a class="navbar-brand c4codes-menu-links logo" href="#"><h1>C4codes</h1></a>
                  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"> <i class="bi bi-list"></i></button>
                  
                 
               
        



<?php
                  wp_nav_menu( array(
	'menu'            => '',              // (string) Название выводимого меню (указывается в админке при создании меню, приоритетнее 
										  // чем указанное местоположение theme_location - если указано, то параметр theme_location игнорируется)
	'container'       => 'div',           // (string) Контейнер меню. Обворачиватель ul. Указывается тег контейнера (по умолчанию в тег div)
	'container_class' => 'collapse navbar-collapse c4codes-menu',              // (string) class контейнера (div тега)
	'container_id'    => 'navbarSupportedContent',              // (string) id контейнера (div тега)
	'menu_class'      => 'navbar-nav',          // (string) class самого меню (ul тега)
	'menu_id'         => '',              // (string) id самого меню (ul тега)
	'echo'            => true,            // (boolean) Выводить на экран или возвращать для обработки
	'fallback_cb'     => 'wp_page_menu',  // (string) Используемая (резервная) функция, если меню не существует (не удалось получить)
	'before'          => '',              // (string) Текст перед <a> каждой ссылки
	'after'           => '',              // (string) Текст после </a> каждой ссылки
	'link_before'     => '',              // (string) Текст перед анкором (текстом) ссылки
	'link_after'      => '',              // (string) Текст после анкора (текста) ссылки
	'depth'           => 0,               // (integer) Глубина вложенности (0 - неограничена, 2 - двухуровневое меню)
	'walker'          => '',              // (object) Класс собирающий меню. Default: new Walker_Nav_Menu
	'theme_location'  => 'top'               // (string) Расположение меню в шаблоне. (указывается ключ которым было зарегистрировано меню в функции register_nav_menus)
) );

?>





                </div>
            </nav>
        </div>
      
    </header>