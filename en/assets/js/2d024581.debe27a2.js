"use strict";(self.webpackChunkducnguyen_96_github_io=self.webpackChunkducnguyen_96_github_io||[]).push([[5838],{1138:(n,e,a)=>{a.r(e),a.d(e,{assets:()=>h,contentTitle:()=>t,default:()=>o,frontMatter:()=>c,metadata:()=>l,toc:()=>r});var i=a(5893),s=a(1151);const c={sidebar_label:"Basic Usage"},t="Basic Usage",l={id:"nix/package-management/basic-usage",title:"Basic Usage",description:"Installation",source:"@site/docs/nix/package-management/basic-usage.md",sourceDirName:"nix/package-management",slug:"/nix/package-management/basic-usage",permalink:"/en/docs/nix/package-management/basic-usage",draft:!1,unlisted:!1,editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/nix/package-management/basic-usage.md",tags:[],version:"current",frontMatter:{sidebar_label:"Basic Usage"},sidebar:"docs",previous:{title:"Package Management",permalink:"/en/docs/category/package-management"},next:{title:"Home Manager",permalink:"/en/docs/nix/package-management/home-manager"}},h={},r=[{value:"Installation",id:"installation",level:2},{value:"Commands",id:"commands",level:2},{value:"Declarative configuration",id:"declarative-configuration",level:2},{value:"Imperative Operations",id:"imperative-operations",level:2},{value:"User Environments",id:"user-environments",level:3},{value:"Channels",id:"channels",level:3}];function d(n){const e={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,s.a)(),...n.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e.h1,{id:"basic-usage",children:"Basic Usage"}),"\n",(0,i.jsx)(e.h2,{id:"installation",children:"Installation"}),"\n",(0,i.jsx)(e.p,{children:"Recommended option hi\u1ec7n t\u1ea1i cho Linux v\xe0 MacOS:"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-bash",children:"bash <(curl -L https://nixos.org/nix/install) --daemon\n"})}),"\n",(0,i.jsxs)(e.p,{children:["Tham kh\u1ea3o th\xeam ",(0,i.jsx)(e.a,{href:"https://nixos.org/manual/nix/stable/installation/installation.html",children:"\u1edf \u0111\xe2y"})]}),"\n",(0,i.jsx)(e.h2,{id:"commands",children:"Commands"}),"\n",(0,i.jsxs)(e.p,{children:["Xem t\u1ea5t c\u1ea3 c\xe1c commands ",(0,i.jsx)(e.a,{href:"https://nixos.org/manual/nix/stable/command-ref/experimental-commands.html",children:"\u1edf \u0111\xe2y"})]}),"\n",(0,i.jsx)(e.h2,{id:"declarative-configuration",children:"Declarative configuration"}),"\n",(0,i.jsxs)(e.p,{children:["File config ch\xednh th\u1ee9c duy nh\u1ea5t li\xean quan t\u1edbi Nix l\xe0 ",(0,i.jsx)(e.code,{children:"nix.conf"}),"(n\u1eb1m \u1edf ",(0,i.jsx)(e.code,{children:"/etc/nix"}),"), n\xf3 ch\u1ee9a m\u1ed9t s\u1ed1 c\xe0i \u0111\u1eb7t li\xean quan t\u1edbi c\xe1ch Nix build, garbage collection, sandboxing v\xe0 user permissions. Chi ti\u1ebft xem ",(0,i.jsx)(e.a,{href:"https://nixos.org/manual/nix/stable/command-ref/conf-file",children:"\u1edf \u0111\xe2y"})]}),"\n",(0,i.jsxs)(e.p,{children:["[Nixpkgs] l\xe0 repository l\u1edbn nh\u1ea5t c\u1ee7a Nix packages v\xe0 NixOS modules. C\xf3 th\u1ec3 c\u1ea5u h\xecnh n\xf3 qua ",(0,i.jsx)(e.code,{children:"~/.config/nixpkgs/config.nix"})]}),"\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.a,{href:"https://nixos.wiki/wiki/Home_Manager",children:"Home Manager"})," l\xe0 c\xe1ch \u0111\u01b0\u1ee3c khuy\u1ebfn kh\xedch s\u1eed d\u1ee5ng \u0111\u1ec3 declare env cho m\u1ed9t user."]}),"\n",(0,i.jsx)(e.h2,{id:"imperative-operations",children:"Imperative Operations"}),"\n",(0,i.jsxs)(e.p,{children:["Package v\xe0 environment management trong Nix l\xe0 imperative; user environments - bao g\u1ed3m c\u1ea3 package installation v\xe0 removal - \u0111\u01b0\u1ee3c qu\u1ea3n l\xfd b\u1eb1ng l\u1ec7nh ",(0,i.jsx)(e.code,{children:"nix-env"}),", trong khi ",(0,i.jsx)(e.code,{children:"nix-channels"})," x\xe1c \u0111\u1ecbnh phi\xean b\u1ea3n c\u1ee7a Nixpkgs \u0111\u01b0\u1ee3c s\u1eed d\u1ee5ng."]}),"\n",(0,i.jsx)(e.h3,{id:"user-environments",children:"User Environments"}),"\n",(0,i.jsxs)(e.p,{children:["Nix cung c\u1ea5p m\u1ed9t imperative package management command line tool l\xe0 ",(0,i.jsx)(e.code,{children:"nix-env"})," - n\xf3 c\xf3 th\u1ec3 \u0111\u01b0\u1ee3c s\u1eed d\u1ee5ng \u0111\u1ec3 c\xe0i \u0111\u1eb7t c\xe1c package \u1edf user level. C\xe1c package \u0111\u01b0\u1ee3c c\xe0i \u0111\u1eb7t b\u1eb1ng ",(0,i.jsx)(e.code,{children:"nix-env"})," ch\u1ec9 c\xf3 th\u1ec3 \u0111\u01b0\u1ee3c s\u1eed d\u1ee5ng b\u1edfi user \u0111\xf3, v\xe0 kh\xf4ng thay \u0111\u1ed5i tr\u1ea1ng th\xe1i c\u1ee7a h\u1ec7 th\u1ed1ng."]}),"\n",(0,i.jsxs)(e.p,{children:["M\u1ed9t s\u1ed1 ",(0,i.jsx)(e.code,{children:"nix-env"})," commands th\u01b0\u1eddng d\xf9ng:"]}),"\n",(0,i.jsxs)(e.table,{children:[(0,i.jsx)(e.thead,{children:(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.th,{}),(0,i.jsx)(e.th,{})]})}),(0,i.jsxs)(e.tbody,{children:[(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"Searching for packages"}),(0,i.jsx)(e.td,{children:"nix search nixpkgs packagename"})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"Installing packages"}),(0,i.jsx)(e.td,{children:"nix-env -iA packagename"})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"List installed packages"}),(0,i.jsx)(e.td,{children:"nix-env -q"})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"Uninstalling packages"}),(0,i.jsx)(e.td,{children:"nix-env -e packagename"})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"Upgrading packages"}),(0,i.jsx)(e.td,{children:"nix-env -u"})]})]})]}),"\n",(0,i.jsx)(e.h3,{id:"channels",children:"Channels"}),"\n",(0,i.jsxs)(e.p,{children:["C\xe1c Nix packages th\xec \u0111\u01b0\u1ee3c ph\xe2n ph\u1ed1i qua m\u1ed9t v\xe0i Nix channels: c\u01a1 ch\u1ebf \u0111\u1ec3 ph\xe2n ph\u1ed1i Nix expressions c\u0169ng nh\u01b0 c\xe1c binary caches li\xean quan t\u1edbi ch\xfang. C\xe1c channels n\xe0y x\xe1c \u0111\u1ecbnh phi\xean b\u1ea3n c\u1ee7a c\xe1c package, v\xe0 ch\xfang c\xf3 th\u1ec3 \u0111\u01b0\u1ee3c ph\xe2n lo\u1ea1i r\u1ed9ng r\xe3i th\xe0nh c\xe1c channel stable v\xe0 unstable. H\u1ea7u h\u1ebft ng\u01b0\u1eddi d\xf9ng s\u1ebd mu\u1ed1n channel stable, hi\u1ec7n t\u1ea1i l\xe0 nixos-22.05. \u0110\u1ec3 bi\u1ebft th\xeam th\xf4ng tin v\u1ec1 channels v\xe0 c\xe1ch ch\u1ecdn ch\xfang, xem b\xe0i vi\u1ebft ",(0,i.jsx)(e.a,{href:"https://nixos.wiki/wiki/Nix_Channels",children:"Nix Channels"}),"."]}),"\n",(0,i.jsxs)(e.p,{children:["M\u1ed9t s\u1ed1 ",(0,i.jsx)(e.code,{children:"nix-channel"})," commands th\u01b0\u1eddng d\xf9ng:"]}),"\n",(0,i.jsxs)(e.table,{children:[(0,i.jsx)(e.thead,{children:(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.th,{}),(0,i.jsx)(e.th,{})]})}),(0,i.jsxs)(e.tbody,{children:[(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"List current channels"}),(0,i.jsx)(e.td,{children:"nix-channel --list"})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"Add a primary channel"}),(0,i.jsxs)(e.td,{children:["nix-channel --add ",(0,i.jsx)(e.a,{href:"https://nixos.org/channels/channel-name",children:"https://nixos.org/channels/channel-name"})," nixos"]})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"Add other channels"}),(0,i.jsxs)(e.td,{children:["nix-channel --add ",(0,i.jsx)(e.a,{href:"https://some.channel/url",children:"https://some.channel/url"})," my-alias"]})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"Remove a channel"}),(0,i.jsx)(e.td,{children:"nix-channel --remove channel-alias"})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"Updating a channel"}),(0,i.jsx)(e.td,{children:"nix-channel --update channel-alias"})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"Update all channels"}),(0,i.jsx)(e.td,{children:"nix-channel --update"})]})]})]})]})}function o(n={}){const{wrapper:e}={...(0,s.a)(),...n.components};return e?(0,i.jsx)(e,{...n,children:(0,i.jsx)(d,{...n})}):d(n)}},1151:(n,e,a)=>{a.d(e,{Z:()=>l,a:()=>t});var i=a(7294);const s={},c=i.createContext(s);function t(n){const e=i.useContext(c);return i.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function l(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(s):n.components||s:t(n.components),i.createElement(c.Provider,{value:e},n.children)}}}]);