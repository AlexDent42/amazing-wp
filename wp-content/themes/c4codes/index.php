
<?php get_header(  );?>


<div class="row">

    <div class="col-md-9">
<!--===Latest articles section===-->
<div class="section category-section">
       <div class="container">
           <div class="row">
               <div class="nav nav-tabs border-bottom border-dark border-3 mx-3 ">
                   <button class="nav-link bg-dark"  type="button" ><h3 style="color: #fff;"><?php single_cat_title( );?></h3></button>
               </div>
           </div>

           <?php if(have_posts()):
           while(have_posts()): the_post(); ?>

           <!--start card-->
           <div class="card latest-posts-card">
               <div class="row">
              
                   <div class="col-md-4 article-card">
                   <a href="<?php echo get_the_permalink( );?>"><?php the_post_thumbnail('medium', array('class'=>"img-fluid rounded"));?></a>
                   </div>
                   <div class="col-md-8">
                       <div class="card-body">
                           <span class="badge hero-badge"><?php single_cat_title( );?></span>
                           <a href="<?php echo get_the_permalink( );?>">
                           <h2><?php the_title(  );?></h2></a>
                           <p class="fst-italic text-muted" ><?php the_date( );?></p>
                           <p><?php the_excerpt();?></p>
                           
                       </div>
                   </div>
               </div>
             
           </div>
           <hr class="text-muted">
           <!--end card-->
                <?php 
                endwhile;
                
                endif;
                ?>

                    <?php the_posts_pagination( array(
                'show_all'     => false, // show_all -> all pages in pagination
                'end_size'     => 1,     // number of pages at the end
                'mid_size'     => 1,     // number of pages near the active page
                'prev_next'    => true,  // previous/next 
                'prev_text'    => __('⇜ Previous'),
                'next_text'    => __('Next ⇝'),
                'add_args'     => false, // arguments to backlinks
                'add_fragment' => '',     // text to backlinks submission
                'screen_reader_text' => __( ' ' ),
            ));?>
             
           
       </div>
   </div>
    <!--===End Latest articles section===-->
        </div>
        <div class="col-md-3 aside-section">
            <div class="nav nav-tabs border-bottom border-dark border-3 mx-3">
                    <button class="nav-link bg-dark"  type="button" ><h3 style="color: #fff;">More info</h3></button>
                </div>
                <?php if(!function_exists('dynamic_sidebar')|| !dynamic_sidebar( 'Aside Widget' )):?>
                    <?php endif;?> 
            </div>
        </div>




    <?php get_footer(  );?>