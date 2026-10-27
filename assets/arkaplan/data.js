// scripts/arkaplan-data.ps1 tarafından üretildi: Steam'deki resmi fragmanlardan kesitler.
const ARKAPLAN = [
    {
        "game":  "Counter-Strike 2",
        "href":  "cs2/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/730/612468/aa5a28c78f12232e6b6839034550c28b162fad3e/1748810724/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256972298/movie.293x165.jpg",
        "start":  20
    },
    {
        "game":  "Dead by Daylight",
        "href":  "dbd/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/381210/2023277386/529a037c508a565473e058ae680d112fa643cb90/1778680125/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257336144/a6b5c1f58b14644a0952432bcb64fee417cd73de/movie_600x337.jpg",
        "start":  42
    },
    {
        "game":  "Darkest Dungeon",
        "href":  "dd/1/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/262060/50503/a313852a4becb5f5e662685db8e57a8283b7cd85/1750497858/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256659907/movie.293x165.jpg",
        "start":  25
    },
    {
        "game":  "Darkest Dungeon II",
        "href":  "dd/2/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1940340/1759492684/47952bdd0690464b9a569704471817234739d74d/1756317346/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257189874/4aea74ccc5944ec8fcc5d26009b484d972a1da7d/movie_600x337.jpg",
        "start":  24
    },
    {
        "game":  "Rainbow Six Siege",
        "href":  "r6/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/359550/1888613436/b543c846a1f5bd39e4b790745ee5426f0b9b1423/1788250020/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257348863/677073312765855b5295c8629dc0924df67e1b3f/movie_600x337.jpg",
        "start":  23
    },
    {
        "game":  "Mount \u0026 Blade II: Bannerlord",
        "href":  "mb/bannerlord/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/261550/504512/476e368d961936646914b97a28cad87bb2e99872/1750497754/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256910718/movie.293x165.jpg",
        "start":  47
    },
    {
        "game":  "Mount \u0026 Blade: Warband",
        "href":  "mb/warband/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/48700/5491/b143f5c952a6b11b8e73776fa5f35497d96dea0c/1750492319/hls_264_1_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/80952/movie.293x165.jpg",
        "start":  20
    },
    {
        "game":  "The Witcher 3",
        "href":  "witcher3/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/292030/1018852715/bf5e4c4a6409b1714754e691e778ae9f66ab9907/1790683068/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257439641/32f72964eceaa2ea37c3ab03dff903a45414a89b/movie_600x337.jpg",
        "start":  42
    },
    {
        "game":  "Cyberpunk 2077",
        "href":  "cp2077/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1091500/512843956/7ddc0c953816d19d719b299eb76b1ce188e17225/1792676918/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257474177/d3648c90317ee936369fd886a02a0f54c0a86395/movie_600x337.jpg",
        "start":  28
    },
    {
        "game":  "Project Zomboid",
        "href":  "pz/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/108600/619982392/141cfd121ea068a87c023951bdbfee87ca524de1/1785320937/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257387571/7413640d5700fc7020002682b958233c04463d0e/movie_600x337.jpg",
        "start":  56
    },
    {
        "game":  "Sea of Thieves",
        "href":  "sot/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1172620/2026344220/6ebc4b13a13791d3a614b638e75ebf3fe1bd9f5d/1774018273/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257306747/795fd3448e5c8777a744f224664d3a9664e86ea1/movie_600x337.jpg",
        "start":  31
    },
    {
        "game":  "Brotato",
        "href":  "brotato/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1942280/776977/3c3b725174c83d8d873735bd5e80af3220010ed7/1750742089/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257068272/b863cc9a99a69311bd096c843636f34396b67035/movie_600x337.jpg",
        "start":  21
    },
    {
        "game":  "Battlefield 1",
        "href":  "bf1/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1238840/303583/a81d74a5289ae78f6e410c785363ddb176f7ccb3/1750647980/hls_264_1_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256795873/movie.293x165.jpg",
        "start":  40
    },
    {
        "game":  "Battlefield 3",
        "href":  "bf3/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1238820/289908/9e81691cc4b2689d760b576504aa2bcd92582183/1750647972/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256787639/movie.293x165.jpg",
        "start":  33
    },
    {
        "game":  "Battlefield 4",
        "href":  "bf4/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1238860/289696/42e5cc24d7371815b8ffe6644c733485054a02b9/1750648003/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256787502/movie.293x165.jpg",
        "start":  41
    },
    {
        "game":  "Battlefield V",
        "href":  "bfv/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1238810/321074/ced8eed0ae8f8f0056d4f40cb35a8056f9777f2d/1750647963/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256806061/movie.293x165.jpg",
        "start":  71
    },
    {
        "game":  "Battlefield 6",
        "href":  "bf6/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/2807960/1874905565/6237f694851e71f764b448a6f93d27e9316fc1db/1791915875/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257459845/e063eea41b1c0fc5d02e305346d86afb582eac3e/movie_600x337.jpg",
        "start":  30
    },
    {
        "game":  "Company of Heroes",
        "href":  "coh1/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/228200/127388/40dd66105db24f88ae7c0b3d981d62d582b4a5de/1750493771/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256697740/movie.293x165.jpg",
        "start":  51
    },
    {
        "game":  "Company of Heroes 2",
        "href":  "coh2/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/231430/42191/9bbbe9536736a1fda24400dc2a69da310f8e697a/1750495251/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256656131/movie.293x165.jpg",
        "start":  40
    },
    {
        "game":  "Company of Heroes 3",
        "href":  "coh3/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1677280/1389550022/55bd2dcf8c59498d83de3eb58eb6421e3c074af5/1792183979/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257465154/8af11b20de9df826239d46d2bf9da6060c0ad5d2/movie_600x337.jpg",
        "start":  109
    },
    {
        "game":  "Elden Ring",
        "href":  "eldenring/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1245620/468149/7d588828f80907ca97efdcb1e6ef72b4ce2b1d0d/1750650511/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256889456/movie.293x165.jpg",
        "start":  10
    },
    {
        "game":  "Age of Empires",
        "href":  "aoe1/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1017900/238959/e40739b70bab45bc3e0c187b84ecc7ca89364e02/1750606805/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256759482/movie.293x165.jpg",
        "start":  25
    },
    {
        "game":  "Age of Empires II",
        "href":  "aoe2/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/813780/228198/a6de3656546a02339a9a89290068c2ac4d51fd68/1750586036/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256753456/movie.293x165.jpg",
        "start":  20
    },
    {
        "game":  "Age of Empires III",
        "href":  "aoe3/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/933110/308445/e83c069f741c8102f7a921fcb4df18a10ac8190a/1750597582/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256798809/movie.293x165.jpg",
        "start":  35
    },
    {
        "game":  "Age of Empires IV",
        "href":  "aoe4/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1466860/508877/3b34a780bf9c93550bcbdb69b2c251f2445497b0/1750692421/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256913281/movie.293x165.jpg",
        "start":  30
    },
    {
        "game":  "Age of Mythology",
        "href":  "aom/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1934680/760806/f67b0d7fddc010fe76e669ca28440e67075bb9b7/1750741477/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257058147/movie.293x165.jpg",
        "start":  10
    },
    {
        "game":  "Risk of Rain",
        "href":  "ror1/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/248820/14440/f5e933307db87bd962ff313be46c72a6f40647fc/1750487603/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2029758/movie.293x165.jpg",
        "start":  54
    },
    {
        "game":  "Risk of Rain Returns",
        "href":  "rorr/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1337520/626868/0ef8765e06f6fc3509d62e07e40036df0584ccbd/1750674289/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256980660/movie.293x165.jpg",
        "start":  46
    },
    {
        "game":  "Risk of Rain 2",
        "href":  "ror2/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/632360/83804956/1baf9dbc3089c707258f7084315f4467e7fb3040/1750564385/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257150713/e1151f94452c3bf926dda777a08fc01524b75612/movie_600x337.jpg",
        "start":  20
    },
    {
        "game":  "Bloons TD 5",
        "href":  "btd5/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/306020/27508/91684593dd506f60f2e6ba90526c3af7bd52e66b/1750504330/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2035538/movie.293x165.jpg",
        "start":  30
    },
    {
        "game":  "Bloons TD Battles 2",
        "href":  "btdb2/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1276390/416530/7237f06d264337e3f869f6171e6f7a81dcdf427f/1750659477/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256860149/movie.293x165.jpg",
        "start":  10
    },
    {
        "game":  "Bloons TD 6",
        "href":  "btd6/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/960090/1670312461/10857a52f756c7a1f3d6be85f088beeb7873e3ec/1782122781/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257363584/70825b7d01b2fcd4a6084d3925d89b0608633610/movie_600x337.jpg",
        "start":  17
    },
    {
        "game":  "Megabonk",
        "href":  "megabonk/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/3405340/812784606/5b46f6fdaa53e5fbc456785234d21932a94fdd14/1758154057/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257200591/a061ddee3b5e3494eff00a00161292eac8102a20/movie_600x337.jpg",
        "start":  13
    },
    {
        "game":  "Euro Truck Simulator 2",
        "href":  "ets2/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/227300/455253/f717b44f949ed6c824778b30d516147bdaaad95a/1750482436/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256882174/movie.293x165.jpg",
        "start":  54
    },
    {
        "game":  "Hearts of Iron III",
        "href":  "hoi3/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/25890/1892/e703544ddc164d151e9e59c967f1fb6dc2f5c6d3/1750484985/hls_264_0_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/5244/movie.jpg",
        "start":  35
    },
    {
        "game":  "Hearts of Iron IV",
        "href":  "hoi4/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/394360/682731/bd7bbea629ccbef568dd3c4d8552ba6e05b3c0ed/1750525316/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257012977/movie.293x165.jpg",
        "start":  27
    },
    {
        "game":  "World of Tanks",
        "href":  "wot/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1407200/1608086189/95fdbde1ee98c4bbd647ce1a75c4addf1ed44560/1750685624/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256819202/be8d8667f59744b631aae5ea7647e934d025d72f/movie_600x337.jpg",
        "start":  20
    },
    {
        "game":  "Total War: Warhammer III",
        "href":  "tww3/",
        "src":  "https://video.akamai.steamstatic.com/store_trailers/1142710/539677/e598079c9bc92ad089825060102465987d361027/1750627141/hls_264_2_video.m3u8",
        "poster":  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256930877/movie.293x165.jpg",
        "start":  64
    },
    {
        "game":  "League of Legends",
        "href":  "lol/",
        "file":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/1f5b2cf01a1cf2afa1ce61febee6e2e900808347.mp4",
        "start":  0
    }
];
