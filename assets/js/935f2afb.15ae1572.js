"use strict";(self.webpackChunkducnguyen_96_github_io=self.webpackChunkducnguyen_96_github_io||[]).push([[53],{1109:e=>{e.exports=JSON.parse('{"pluginId":"default","version":"current","label":"Next","banner":null,"badge":false,"noIndex":false,"className":"docs-version-current","isLast":true,"docsSidebars":{"docs":[{"type":"category","label":"Go","collapsed":false,"items":[{"type":"category","label":"REST Server","collapsed":false,"items":[{"type":"link","label":"S\u1eed d\u1ee5ng standard library","href":"/docs/go/rest-server/standard-library","docId":"go/rest-server/standard-library","unlisted":false},{"type":"link","label":"S\u1eed d\u1ee5ng router package","href":"/docs/go/rest-server/using-a-router-package","docId":"go/rest-server/using-a-router-package","unlisted":false},{"type":"link","label":"S\u1eed d\u1ee5ng framework","href":"/docs/go/rest-server/using-a-web-framework","docId":"go/rest-server/using-a-web-framework","unlisted":false},{"type":"link","label":"S\u1eed d\u1ee5ng OpenAPI v\xe0 Swagger","href":"/docs/go/rest-server/using-openapi-and-swagger","docId":"go/rest-server/using-openapi-and-swagger","unlisted":false},{"type":"link","label":"Middleware","href":"/docs/go/rest-server/middleware","docId":"go/rest-server/middleware","unlisted":false},{"type":"link","label":"Authentication","href":"/docs/go/rest-server/authentication","docId":"go/rest-server/authentication","unlisted":false}],"collapsible":true,"href":"/docs/category/rest-server"}],"collapsible":true,"href":"/docs/category/go"},{"type":"category","label":"Nodejs","collapsed":false,"items":[{"type":"category","label":"REST Server","collapsed":false,"items":[{"type":"link","label":"S\u1eed d\u1ee5ng standard library","href":"/docs/nodejs/rest-server/standard-library","docId":"nodejs/rest-server/standard-library","unlisted":false},{"type":"link","label":"S\u1eed d\u1ee5ng router module","href":"/docs/nodejs/rest-server/using-a-router-package","docId":"nodejs/rest-server/using-a-router-package","unlisted":false},{"type":"link","label":"S\u1eed d\u1ee5ng framework","href":"/docs/nodejs/rest-server/using-a-web-framework","docId":"nodejs/rest-server/using-a-web-framework","unlisted":false},{"type":"link","label":"S\u1eed d\u1ee5ng OpenAPI v\xe0 Swagger","href":"/docs/nodejs/rest-server/using-openapi-and-swagger","docId":"nodejs/rest-server/using-openapi-and-swagger","unlisted":false}],"collapsible":true,"href":"/docs/category/rest-server-1"}],"collapsible":true,"href":"/docs/category/nodejs"},{"type":"category","label":"Nix","collapsed":false,"items":[{"type":"category","label":"Nix Language","collapsed":false,"items":[{"type":"link","label":"Basic","href":"/docs/nix/nix-language/basic","docId":"nix/nix-language/basic","unlisted":false},{"type":"link","label":"Functions and Imports","href":"/docs/nix/nix-language/functions-and-imports","docId":"nix/nix-language/functions-and-imports","unlisted":false},{"type":"link","label":"Derivation","href":"/docs/nix/nix-language/derivation","docId":"nix/nix-language/derivation","unlisted":false},{"type":"link","label":"nix-shell","href":"/docs/nix/nix-language/nix-shell","docId":"nix/nix-language/nix-shell","unlisted":false},{"type":"link","label":"Inputs Design Pattern","href":"/docs/nix/nix-language/inputs-design-pattern","docId":"nix/nix-language/inputs-design-pattern","unlisted":false}],"collapsible":true,"href":"/docs/category/nix-language"},{"type":"category","label":"Package Management","collapsed":false,"items":[{"type":"link","label":"Basic Usage","href":"/docs/nix/package-management/basic-usage","docId":"nix/package-management/basic-usage","unlisted":false},{"type":"link","label":"Home Manager","href":"/docs/nix/package-management/home-manager","docId":"nix/package-management/home-manager","unlisted":false},{"type":"link","label":"Profiles","href":"/docs/nix/package-management/profiles","docId":"nix/package-management/profiles","unlisted":false},{"type":"link","label":"Garbage Collection","href":"/docs/nix/package-management/garbage-collection","docId":"nix/package-management/garbage-collection","unlisted":false}],"collapsible":true,"href":"/docs/category/package-management"}],"collapsible":true,"href":"/docs/category/nix"}]},"docs":{"go/rest-server/authentication":{"id":"go/rest-server/authentication","title":"Authentication","description":"Trong b\xe0i n\xe0y th\xec ta s\u1ebd n\xf3i v\u1ec1 authentication v\xe0 b\u1ea3o m\u1eadt n\xf3i chung. Trong c\xe1c b\xe0i tr\u01b0\u1edbc, n\u1ebfu task server c\u1ee7a ta \u0111\u01b0\u1ee3c deployed publicly, th\xec to\xe0n b\u1ed9 API c\u1ee7a n\xf3 s\u1ebd \u0111\u01b0\u1ee3c truy c\u1eadp b\u1edfi b\u1ea5t k\u1ef3 ai c\xf3 k\u1ebft n\u1ed1i internet. M\u1eb7c d\xf9 \u0111i\u1ec1u n\xe0y ph\xf9 h\u1ee3p v\u1edbi m\u1ed9t s\u1ed1 REST server, nh\u01b0ng kh\xf4ng ph\u1ea3i l\xfac n\xe0o ta c\u0169ng mu\u1ed1n nh\u01b0 v\u1eady. Th\xf4ng th\u01b0\u1eddng, \xedt nh\u1ea5t m\u1ed9t ph\u1ea7n c\u1ee7a API ph\u1ea3i l\xe0 private/protected \u0111\u1ec3 ch\u1ec9 c\xf3 user \u0111\xe3 \u0111\u01b0\u1ee3c x\xe1c th\u1ef1c m\u1edbi c\xf3 th\u1ec3 truy c\u1eadp.","sidebar":"docs"},"go/rest-server/middleware":{"id":"go/rest-server/middleware","title":"Middleware","description":"B\xe0i vi\u1ebft n\xe0y m\xf4 t\u1ea3 c\u01a1 b\u1ea3n c\u01a1 ch\u1ebf ho\u1ea1t \u0111\u1ed9ng c\u1ee7a middleware trong Go. N\u1ebfu b\u1ea1n ch\u01b0a \u0111\u1ecdc th\xec h\xe3y \u0111\u1ecdc n\xf3 tr\u01b0\u1edbc khi ti\u1ebfp t\u1ee5c b\xe0i vi\u1ebft.","sidebar":"docs"},"go/rest-server/standard-library":{"id":"go/rest-server/standard-library","title":"S\u1eed d\u1ee5ng standard library","description":"M\u1ed9t trong nh\u1eefng c\xe2u h\u1ecfi th\u01b0\u1eddng g\u1eb7p \u1edf Developer l\xfac chu\u1ea9n b\u1ecb start 1 project n\xe0o \u0111\u1ea5y l\xe0 \\"N\xean s\u1eed d\u1ee5ng framework n\xe0o?\\". \u0110\u1ed1i v\u1edbi nhi\u1ec1u ng\xf4n ng\u1eef th\xec \u0111i\u1ec1u n\xe0y l\xe0 ho\xe0n to\xe0n b\xecnh th\u01b0\u1eddng nh\u01b0ng v\u1edbi Go th\xec kh\xf4ng ph\u1ea3i l\xfac n\xe0o c\u0169ng v\u1eady. C\xf3 nhi\u1ec1u \xfd ki\u1ebfn tr\xe1i chi\u1ec1u v\u1ec1 vi\u1ec7c n\xean s\u1eed d\u1ee5ng frameworks hay kh\xf4ng v\u1edbi Go. M\u1ee5c ti\xeau c\u1ee7a series n\xe0y l\xe0 xem x\xe9t m\u1ed9t c\xe1ch kh\xe1ch quan t\u1eeb nhi\u1ec1u g\xf3c \u0111\u1ed9.","sidebar":"docs"},"go/rest-server/using-a-router-package":{"id":"go/rest-server/using-a-router-package","title":"S\u1eed d\u1ee5ng router package","description":"Ph\u1ea7n 1 k\u1ebft th\xfac v\u1edbi 1 Go server, ta \u0111\xe3 refactor b\u01b0\u1edbc render JSON th\xe0nh 1 helper function.","sidebar":"docs"},"go/rest-server/using-a-web-framework":{"id":"go/rest-server/using-a-web-framework","title":"S\u1eed d\u1ee5ng framework","description":"Ch\u1ecdn framework","sidebar":"docs"},"go/rest-server/using-openapi-and-swagger":{"id":"go/rest-server/using-openapi-and-swagger","title":"S\u1eed d\u1ee5ng OpenAPI v\xe0 Swagger","description":"Trong b\xe0i n\xe0y ta s\u1ebd th\u1ea3o lu\u1eadn c\xe1ch m\xe0 OpenAPI v\xe0 Swagger \u0111\u01b0\u1ee3c s\u1eed d\u1ee5ng \u0111\u1ec3 define REST APIs m\u1ed9t c\xe1ch \u0111\u01b0\u1ee3c ti\xeau chu\u1ea9n h\xf3a v\xe0 t\xecm hi\u1ec3u c\xe1ch \u0111\u1ec3 generate Go code t\u1eeb OpenAPI specification.","sidebar":"docs"},"nix/nix-language/basic":{"id":"nix/nix-language/basic","title":"Basic","description":"Nix Language \u0111\u01b0\u1ee3c s\u1eed d\u1ee5ng \u0111\u1ec3 vi\u1ebft c\xe1c expressions \u0111\u1ec3 t\u1ea1o ra derivations. C\xf4ng c\u1ee5 nix-build \u0111\u01b0\u1ee3c s\u1eed d\u1ee5ng \u0111\u1ec3 build derivations t\u1eeb m\u1ed9t expression.","sidebar":"docs"},"nix/nix-language/derivation":{"id":"nix/nix-language/derivation","title":"Derivation","description":"Derivation function","sidebar":"docs"},"nix/nix-language/functions-and-imports":{"id":"nix/nix-language/functions-and-imports","title":"Functions and Imports","description":"Nameless and single parameter","sidebar":"docs"},"nix/nix-language/inputs-design-pattern":{"id":"nix/nix-language/inputs-design-pattern","title":"Inputs Design Pattern","description":"Tr\u01b0\u1edbc khi \u0111i v\xe0o inputs design pattern th\xec ta h\xe3y t\u1ea1o th\xeam m\u1ed9t v\xed d\u1ee5, l\u1ea7n n\xe0y ta s\u1ebd build graphviz.","sidebar":"docs"},"nix/nix-language/nix-shell":{"id":"nix/nix-language/nix-shell","title":"nix-shell","description":"nix-shell l\xe0 m\u1ed9t tool cung c\u1ea5p cho ta 1 shell c\xf9ng v\u1edbi c\xe1c env variables c\u1ea7n thi\u1ebft \u0111\u1ec3 v\u1ecdc v\u1ea1ch derivation. N\xf3 kh\xf4ng build derivation nh\u01b0ng m\xe0 n\xf3 th\u1ec3 gi\xfap ta ch\u1ea1y t\u1eebng b\u01b0\u1edbc build m\u1ed9t manually.","sidebar":"docs"},"nix/package-management/basic-usage":{"id":"nix/package-management/basic-usage","title":"Basic Usage","description":"Installation","sidebar":"docs"},"nix/package-management/flakes":{"id":"nix/package-management/flakes","title":"Flakes","description":"Flake l\xe0 m\u1ed9t t\xednh n\u0103ng th\u1eed nghi\u1ec7m c\u1ee7a Nix \u0111\u01b0\u1ee3c th\xeam v\xe0o t\u1eeb b\u1ea3n 2.4"},"nix/package-management/garbage-collection":{"id":"nix/package-management/garbage-collection","title":"Garbage Collection","description":"C\xe1c nix-env operations ch\u1eb3ng h\u1ea1n nh\u01b0 upgrade (-u) v\xe0 uninstall (-e) kh\xf4ng bao gi\u1edd x\xf3a c\xe1c packages kh\u1ecfi h\u1ec7 th\u1ed1ng m\xe0 l\xe0 t\u1ea1o ra m\u1ed9t user environment m\u1edbi kh\xf4ng ch\u1ee9a c\xe1c symlinks t\u1edbi c\xe1c packages \u0111\xe3 b\u1ecb \u201cx\xf3a\u201d.","sidebar":"docs"},"nix/package-management/home-manager":{"id":"nix/package-management/home-manager","title":"Home Manager","description":"Home Manager l\xe0 m\u1ed9t h\u1ec7 th\u1ed1ng \u0111\u1ec3 qu\u1ea3n l\xfd m\xf4i tr\u01b0\u1eddng user b\u1eb1ng c\xe1ch s\u1eed d\u1ee5ng Nix package manager. N\xf3i c\xe1ch kh\xe1c, Home Manager cho ph\xe9p b\u1ea1n","sidebar":"docs"},"nix/package-management/profiles":{"id":"nix/package-management/profiles","title":"Profiles","description":"Profiles v\xe0 user environments l\xe0 c\xe1c c\u01a1 ch\u1ebf c\u1ee7a Nix cho ph\xe9p c\xe1c users kh\xe1c nhau c\xf3 th\u1ec3 c\xf3 c\xe1c config kh\xe1c nhau, c\xf3 th\u1ec3 atomic upgrade v\xe0 rollbacks.","sidebar":"docs"},"nodejs/rest-server/standard-library":{"id":"nodejs/rest-server/standard-library","title":"S\u1eed d\u1ee5ng standard library","description":"T\u01b0\u01a1ng t\u1ef1 nh\u01b0 v\u1edbi series rest-server v\u1edbi Go \u1edf ph\xeda tr\xean th\xec series n\xe0y c\u0169ng s\u1ebd c\u1ed1 g\u1eafng gi\u1edbi thi\u1ec7u v\u1ec1 c\xe1c c\xe1ch ti\u1ebfp c\u1eadn kh\xe1c nhau \u0111\u1ec3 d\u1ef1ng REST server v\u1edbi NodeJS.","sidebar":"docs"},"nodejs/rest-server/using-a-router-package":{"id":"nodejs/rest-server/using-a-router-package","title":"S\u1eed d\u1ee5ng router module","description":"Ph\u1ea7n 1 k\u1ebft th\xfac v\u1edbi 1 Nodejs server, ta \u0111\xe3 refactor b\u01b0\u1edbc render JSON th\xe0nh 1 helper function.","sidebar":"docs"},"nodejs/rest-server/using-a-web-framework":{"id":"nodejs/rest-server/using-a-web-framework","title":"S\u1eed d\u1ee5ng framework","description":"Ch\u1ecdn framework","sidebar":"docs"},"nodejs/rest-server/using-openapi-and-swagger":{"id":"nodejs/rest-server/using-openapi-and-swagger","title":"S\u1eed d\u1ee5ng OpenAPI v\xe0 Swagger","description":"Trong b\xe0i n\xe0y ta s\u1ebd th\u1ea3o lu\u1eadn c\xe1ch m\xe0 OpenAPI v\xe0 Swagger \u0111\u01b0\u1ee3c s\u1eed d\u1ee5ng \u0111\u1ec3 define REST APIs m\u1ed9t c\xe1ch \u0111\u01b0\u1ee3c ti\xeau chu\u1ea9n h\xf3a v\xe0 t\xecm hi\u1ec3u c\xe1ch \u0111\u1ec3 generate javascript code t\u1eeb OpenAPI specification.","sidebar":"docs"}}}')}}]);