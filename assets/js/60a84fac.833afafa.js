"use strict";(self.webpackChunkducnguyen_96_github_io=self.webpackChunkducnguyen_96_github_io||[]).push([[613],{2087:(n,e,s)=>{s.r(e),s.d(e,{assets:()=>a,contentTitle:()=>c,default:()=>d,frontMatter:()=>l,metadata:()=>r,toc:()=>h});var i=s(5893),t=s(1151);const l={sidebar_label:"nix-shell"},c="nix-shell",r={id:"nix/nix-language/nix-shell",title:"nix-shell",description:"nix-shell l\xe0 m\u1ed9t tool cung c\u1ea5p cho ta 1 shell c\xf9ng v\u1edbi c\xe1c env variables c\u1ea7n thi\u1ebft \u0111\u1ec3 v\u1ecdc v\u1ea1ch derivation. N\xf3 kh\xf4ng build derivation nh\u01b0ng m\xe0 n\xf3 th\u1ec3 gi\xfap ta ch\u1ea1y t\u1eebng b\u01b0\u1edbc build m\u1ed9t manually.",source:"@site/docs/nix/nix-language/nix-shell.md",sourceDirName:"nix/nix-language",slug:"/nix/nix-language/nix-shell",permalink:"/docs/nix/nix-language/nix-shell",draft:!1,unlisted:!1,editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/nix/nix-language/nix-shell.md",tags:[],version:"current",frontMatter:{sidebar_label:"nix-shell"},sidebar:"docs",previous:{title:"Derivation",permalink:"/docs/nix/nix-language/derivation"},next:{title:"Inputs Design Pattern",permalink:"/docs/nix/nix-language/inputs-design-pattern"}},a={},h=[{value:"Builder for nix-shell",id:"builder-for-nix-shell",level:2}];function u(n){const e={code:"code",h1:"h1",h2:"h2",p:"p",pre:"pre",strong:"strong",...(0,t.a)(),...n.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e.h1,{id:"nix-shell",children:"nix-shell"}),"\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.code,{children:"nix-shell"})," l\xe0 m\u1ed9t tool cung c\u1ea5p cho ta 1 shell c\xf9ng v\u1edbi c\xe1c env variables c\u1ea7n thi\u1ebft \u0111\u1ec3 v\u1ecdc v\u1ea1ch derivation. N\xf3 kh\xf4ng build derivation nh\u01b0ng m\xe0 n\xf3 th\u1ec3 gi\xfap ta ch\u1ea1y t\u1eebng b\u01b0\u1edbc build m\u1ed9t manually."]}),"\n",(0,i.jsxs)(e.p,{children:["Trong m\u1ed9t nix env th\xec n\u1ebfu b\u1ea1n kh\xf4ng c\xf3 access t\u1edbi 1 lib/program n\xe0o th\xec b\u1ea1n ph\u1ea3i c\xe0i \u0111\u1eb7t ch\xfang v\u1edbi ",(0,i.jsx)(e.code,{children:"nix-env"}),". Tuy nhi\xean c\xe0i \u0111\u1eb7t lib b\u1eb1ng ",(0,i.jsx)(e.code,{children:"nix-env"})," kh\xf4ng ph\u1ea3i l\xe0 1 good practice, t\u01b0\u01a1ng t\u1ef1 nh\u01b0 vi\u1ebft app python v\u1eady, b\u1ea1n s\u1ebd c\u1ea7n 1 m\xf4i tr\u01b0\u1eddng bi\u1ec7t l\u1eadp \u0111\u1ec3 dev."]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-bash",children:"$ nix-shell hello.nix\n[nix-shell]$ make\nbash: make: command not found\n[nix-shell]$ echo $baseInputs\n/nix/store/jff4a6zqi0yrladx3kwy4v6844s3swpc-gnutar-1.27.1 [...]\n"})}),"\n",(0,i.jsxs)(e.p,{children:["G\u1ecdi ",(0,i.jsx)(e.code,{children:"nix-shell"})," t\u1edbi 1 nix expression s\u1ebd tr\u1ea3 v\u1ec1 1 derivation v\xe0 ch\xfang ta access v\xe0o 1 shell nh\u01b0ng shell n\xe0y ch\u01b0a c\xf3 g\xec. Tuy nhi\xean ta c\xf3 c\xe1c env variables m\xe0 \u0111\xe3 \u0111\u01b0\u1ee3c set trong derivation nh\u01b0 ",(0,i.jsx)(e.strong,{children:"$baseInputs"}),", ",(0,i.jsx)(e.strong,{children:"$buildInputs"}),", ",(0,i.jsx)(e.strong,{children:"$src"}),", ..."]}),"\n",(0,i.jsxs)(e.p,{children:["\u0110i\u1ec1u n\xe0y c\xf3 ngh\u0129a l\xe0 ta c\xf3 th\u1ec3 source ",(0,i.jsx)(e.code,{children:"builder.sh"})," \u0111\u1ec3 build derivation. Tuy nhi\xean th\xec b\u1ea1n c\xf3 th\u1ec3 g\u1eb7p l\u1ed7i v\xec user trong shell c\xf3 th\u1ec3 kh\xf4ng c\xf3 quy\u1ec1n write t\u1edbi ",(0,i.jsx)(e.strong,{children:"/nix/store"})]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-bash",children:"[nix-shell]$ source builder.sh\n...\n"})}),"\n",(0,i.jsx)(e.h2,{id:"builder-for-nix-shell",children:"Builder for nix-shell"}),"\n",(0,i.jsxs)(e.p,{children:["\u0110\u1ec3 ti\u1ec7n h\u01a1n khi s\u1eed d\u1ee5ng nix-shell th\xec ta c\xf3 th\u1ec3 split builder.sh ra th\xe0nh 2 file l\xe0 ",(0,i.jsx)(e.code,{children:"setup.sh"})," v\xe0 ",(0,i.jsx)(e.code,{children:"builder.sh"}),".\nSetup c\u1ee7a ch\xfang ta s\u1ebd nh\u01b0 t\xean g\u1ecdi c\u1ee7a n\xf3 l\xe0 \u0111\u1ec3 setup tr\u01b0\u1edbc khi build v\xe0 builder th\xec s\u1ebd g\u1ecdi setup sau \u0111\xf3 build."]}),"\n",(0,i.jsxs)(e.p,{children:["Ta c\u0169ng s\u1ebd wrap c\xe1c phase trong qu\xe1 tr\xecnh setup th\xe0nh c\xe1c functions. ",(0,i.jsx)(e.code,{children:"setup.sh"})," s\u1ebd nh\u01b0 sau:"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-bash",children:"unset PATH\nfor p in $baseInputs $buildInputs; do\n  export PATH=$p/bin${PATH:+:}$PATH\ndone\n\nfunction unpackPhase() {\n  tar -xzf $src\n\n  for d in *; do\n    if [ -d \"$d\" ]; then\n      cd \"$d\"\n      break\n    fi\n  done\n}\n\nfunction configurePhase() {\n  ./configure --prefix=$out\n}\n\nfunction buildPhase() {\n  make\n}\n\nfunction installPhase() {\n  make install\n}\n\nfunction fixupPhase() {\n  find $out -type f -exec patchelf --shrink-rpath '{}' \\; -exec strip '{}' \\; 2>/dev/null\n}\n\nfunction genericBuild() {\n  unpackPhase\n  configurePhase\n  buildPhase\n  installPhase\n  fixupPhase\n}\n"})}),"\n",(0,i.jsxs)(e.p,{children:["V\xe0 ",(0,i.jsx)(e.code,{children:"builder.sh"})," s\u1ebd nh\u01b0 sau:"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-bash",children:"set -e\nsource $setup\ngenericBuild\n"})}),"\n",(0,i.jsx)(e.p,{children:"Cu\u1ed1i c\xf9ng ta s\u1ebd th\xeam setup v\xe0o nix file:"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-nix",children:'pkgs: attrs:\n  let defaultAttrs = {\n    builder = "${pkgs.bash}/bin/bash";\n    args = [ ./builder.sh ];\n    setup = ./setup.sh;\n    baseInputs = with pkgs; [ gnutar gzip gnumake gcc coreutils gawk gnused gnugrep binutils.bintools patchelf findutils ];\n    buildInputs = [];\n    system = builtins.currentSystem;\n  };\n  in\n  derivation (defaultAttrs // attrs)\n'})}),"\n",(0,i.jsxs)(e.p,{children:["B\xe2y gi\u1edd \u0111\u1ec3 ch\u1ea1y 1 step b\u1ea5t k\u1ef3 trong qu\xe1 tr\xecnh setup th\xec ta ch\u1ec9 c\u1ea7n source ",(0,i.jsx)(e.code,{children:"setup.sh"})," v\xe0 g\u1ecdi function t\u01b0\u01a1ng \u1ee9ng. V\xed d\u1ee5:"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-bash",children:"$ nix-shell hello.nix\n[nix-shell]$ source $setup\n[nix-shell]$\n"})})]})}function d(n={}){const{wrapper:e}={...(0,t.a)(),...n.components};return e?(0,i.jsx)(e,{...n,children:(0,i.jsx)(u,{...n})}):u(n)}},1151:(n,e,s)=>{s.d(e,{Z:()=>r,a:()=>c});var i=s(7294);const t={},l=i.createContext(t);function c(n){const e=i.useContext(l);return i.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function r(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(t):n.components||t:c(n.components),i.createElement(l.Provider,{value:e},n.children)}}}]);