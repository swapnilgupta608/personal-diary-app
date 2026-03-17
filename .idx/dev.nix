{ pkgs, ... }: {
  channel = "stable-25.05";
  packages = [
    pkgs.nodejs_22
    pkgs.jdk17_headless
    pkgs.gradle
    pkgs.android-tools
    pkgs.watchman
    pkgs.curl
    pkgs.glib
    pkgs.nspr
    pkgs.nss
    pkgs.dbus
    pkgs.atk
    pkgs.at-spi2-atk
    pkgs.cups
    pkgs.cairo
    pkgs.gdk-pixbuf
    pkgs.gtk3
    pkgs.pango
    pkgs.xorg.libX11
    pkgs.xorg.libxcb
    pkgs.xorg.libXcomposite
    pkgs.xorg.libXcursor
    pkgs.xorg.libXdamage
    pkgs.xorg.libXext
    pkgs.xorg.libXfixes
    pkgs.xorg.libXi
    pkgs.xorg.libXrandr
    pkgs.xorg.libXrender
    pkgs.xorg.libXScrnSaver
    pkgs.xorg.libXtst
    pkgs.alsa-lib
    pkgs.mesa
    pkgs.libglvnd
    pkgs.libGL
    pkgs.libGLU
    pkgs.expat
    pkgs.libxkbcommon
    pkgs.udev
    pkgs.fontconfig
    pkgs.libgbm
    pkgs.libdrm # Added for libgbm compatibility
    pkgs.wayland 
  ];

  # CRITICAL: This allows React Native DevTools to find the libraries in the Nix Store
  env = {
    LD_LIBRARY_PATH = "${pkgs.libgbm}/lib:${pkgs.libdrm}/lib:${pkgs.libxkbcommon}/lib:${pkgs.wayland}/lib:${pkgs.mesa}/lib:${pkgs.gtk3}/lib:${pkgs.pango}/lib:${pkgs.cairo}/lib:${pkgs.gdk-pixbuf}/lib:${pkgs.glib}/lib:${pkgs.nss}/lib:${pkgs.nspr}/lib:${pkgs.atk}/lib:${pkgs.at-spi2-atk}/lib";
  };

  idx = {
    extensions = [
      "msjsdiag.vscode-react-native"
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
    ];
    workspace = {
      onCreate = {
        install = ''
          # 1. Install JS dependencies once
          npm install --prefer-offline --no-audit --no-progress

          # 2. Setup Android Environment (Using system tools to save /home space)
          # We point to the pre-installed tools rather than downloading new ones to /home
          export ANDROID_HOME=$HOME/Android/Sdk
          mkdir -p $ANDROID_HOME

          # 3. Accept licenses properly
          yes | sdkmanager --licenses || true
          
          echo -e "\033[1;32m✓ Environment ready. Gradle cache preserved to save space.\033[0m"
        '';
      };
    };
    previews = {
      enable = true;
      previews = {
        android = {
          command = [
            "sh"
            "-c"
            ''
              export ANDROID_SERIAL=emulator-5554
              watchman watch-project .
              export RCT_METRO_PORT=$PORT
              npm start &
              METRO_PID=$!
              until curl -s http://localhost:$PORT/status > /dev/null; do sleep 2; done
              npm run android
              wait $METRO_PID
            ''
          ];
          manager = "web";
        };
      };
    };
  };
}