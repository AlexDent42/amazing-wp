
<?php get_header(  );?>


<div class="row">

    <div class="col-md-9">
<!--===Latest articles section===-->
<div class="section category-section">
       <div class="container">
           <div class="row">
               <div class="nav nav-tabs border-bottom border-dark border-3 mx-3 ">
                   <button class="nav-link bg-dark"  type="button" ><h3 style="color: #fff;"><?php $category = get_the_category(); echo $category[0]->name ;?></h3></button>
               </div>
           </div>

           <?php if(have_posts()): the_post(); ?>

           <!--start card-->
           <div class="card latest-posts-card">
               <div class="row">
              
                   <div class="col-md-12 article-card">
                    
                       <div class="card-body">
                           <span class="badge hero-badge"><?php $category = get_the_category(); echo $category[0]->name ;?></span>
                           <h2><?php the_title(  );?></h2>
                           <p class="fst-italic text-muted" ><i class="bi bi-stopwatch"></i> <?php the_date( );?></p>
                           <?php echo get_the_post_thumbnail( );?>
                           <div class="py-3">
                           <?php the_content( );?>
                            </div>
                           <?php the_tags( before, sep, after );?>
                           
                       </div>
                   </div>
               </div>
             
           </div>
           <hr class="text-muted">
           <!--end card-->
                <?php 
               
                
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