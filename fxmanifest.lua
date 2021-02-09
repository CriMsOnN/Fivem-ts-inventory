fx_version "bodacious"
game "gta5"

ui_page "html/ui.html"

client_script "dist/client/*.client.js"
server_scripts {
  "dist/server/*.server.js"
}

files {
  "html/*.html",
  "html/css/*.css",
  "html/js/*.js",
  "html/images/*.png",
  "html/images/*.svg"
}
