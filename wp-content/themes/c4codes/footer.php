<footer>
    <section class="footer footer-section">
       <div class="container">
           <div class="row">
           <?php if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar("Footer Widget1") ) : ?>
            <?php endif; ?>
                
            <?php if( !function_exists('dynamic_sidebar') || !dynamic_sidebar('Footer Widget2')):?>
            <?php endif;?>


            <?php if(!function_exists('dynamic_sidebar') || !dynamic_sidebar( 'Footer Widget3' )):?>
            <?php endif;?>
           </div>
       </div>

    </section>
    <section class="footer bg-dark py-5">
        <div class="d-flex justify-content-center">
            <h5>All Rights reserved <a href="">C4codes.com</a></h5>
        </div>
    </section>
  
    <?php wp_footer();?>

</footer>
</html>