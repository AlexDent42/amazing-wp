<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'c4codes' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', 'root' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'JRi4ErEJ{w|J{(K4C+`,*KyuPZW7Lu9Q< ftVMc%Zp/,P3z.*1L~d^(<ZlkpA5*/' );
define( 'SECURE_AUTH_KEY',  '1Ik7w3n;.OkheAp,/R^VdWzH!i&-CsdDOe+*%iv`*hC2q`}N&523]j#^;|F2KWhE' );
define( 'LOGGED_IN_KEY',    ']5p>`1xCljVV^C{JJJh$q,`$WmhNaf(Qa[;OOt&$?iLU{{&c9N1:OUk$.e%eSf8C' );
define( 'NONCE_KEY',        'r`3c[(T68Z)i<[ R%tugo7C&E@u%2^r&[S}b#R4A3nWZ:A6+j%_a[}-!k35^zM5^' );
define( 'AUTH_SALT',        'x+D5fW@:+jt<6IoxDQUhTS{Sw{G$%w6y5bt>o1i~CVfMVP*4N=+u%hze^%])#AdN' );
define( 'SECURE_AUTH_SALT', 'K7jvh%azH)[9lxP^}PkQ@b#uV3MilG#462E$gH%oVbdi6syf 6hH/G-QG1J 1;r.' );
define( 'LOGGED_IN_SALT',   'Z}xh$+~}Z.ysGUg3nNdMHWvP$/.$_d8}dl3BL(^.-Yt78S!?;y#S/V5-3!htJif}' );
define( 'NONCE_SALT',       '~}/f{y#gT>Z!u~usH|s;%>gpj5Emmf;V|2A4*2NSt>[L5nV@-K&9JO$;O>d?3bgt' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', true );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
