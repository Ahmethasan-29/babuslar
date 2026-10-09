// Yetenek videoları: Riot'un resmi ajan sayfalarından (playvalorant.com) alınan adresler.
// Ajan adı → { yetenek adı (İngilizce): video adresi }. Yeni ajan çıkınca: powershell -File scripts/valorant-videos.ps1 -Out valorant/videos.js
const ABILITY_VIDEOS = {
    "Astra":  {
                  "Nova Pulse":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data_live/e54ed10355d571c15ef2ee5a0897cca06851fd56.mp4",
                  "Nebula  / Dissipate":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data_live/2aafadb8cef8c1ab2894a657c23988e921b006c8.mp4",
                  "Gravity Well":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data_live/3439c939846214067561746668bfd96805efc225.mp4",
                  "Astral Form / Cosmic Divide":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data_live/6bed3444d432f27cdac08f3be1dad2760be7052f.mp4"
              },
    "Breach":  {
                   "Flashpoint":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data_live/ffa4695b83e2f959bc59f0393dfc74e533546a89.mp4",
                   "Fault Line":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data_live/a4f24e1fe60879234be5da0f8a768feb8f379fdd.mp4",
                   "Aftershock":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data_live/592212ab60d09999d493c2099f9260d59fab917a.mp4",
                   "Rolling Thunder":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data_live/207b0ab21f8e27e98ca22f4b5546cc0963d94af6.mp4"
               },
    "Brimstone":  {
                      "Stim Beacon":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/da2d65e4abc2129e284cf5248fd70925f093a0b3.mp4",
                      "Incendiary":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/9df59d490062acceb7c6ca32a3650b55718381f7.mp4",
                      "Sky Smoke":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/8e0b72295747346b60c354765944f5233fb208f2.mp4",
                      "Orbital Strike":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ccd8e6c574b7017a2681e5d37c744f5a654327e3.mp4"
                  },
    "Chamber":  {
                    "Rendezvous":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data_live/6d191f3734a8170d99f66642041da9f33240d319.mp4",
                    "Trademark":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data_live/245fa173c5d3677e3838d52fb155b6366d19c91b.mp4",
                    "Headhunter":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data_live/745571f61d83d880c42278a35a072cdd8b7bfa12.mp4",
                    "Tour De Force":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data_live/49f14376a65d54586c350e7fe863ba30911032a0.mp4"
                },
    "Clove":  {
                  "Pick-me-up":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/4adb022f083d3887f73d23f60de71cccb45e6d83.mp4",
                  "Ruse":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/f74f0d7b96cae0bcf51e97ad99883a370508a381.mp4",
                  "Not Dead Yet":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/b9e4ee59e2e2a492ec5a76f71c2161faa6f03981.mp4",
                  "Meddle":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/71b28c3a8e3b6f29a2523f2cada52f2ea5a1eab0.mp4"
              },
    "Cypher":  {
                   "Cyber Cage":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/54a8dfaa9b82c7aaf994b0432bb25ef1e95c985c.mp4",
                   "Spycam":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/825ba0643c74ad583350d1eb562bb7650ad78ae0.mp4",
                   "Trapwire":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/aab21b75eb43f0e8cc9c0b816cb4877ae868b9fd.mp4",
                   "Neural Theft":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ddeaad5ff2e4865351755b71fdc4fc97339fb334.mp4"
               },
    "Deadlock":  {
                     "Sonic Sensor":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/e2c77e5b49fc3b53a7c625eb7646e51e7094dc52.mp4",
                     "Barrier Mesh":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a9dc93d62c1ae6c51b12ed1e84a5d96c678677f9.mp4",
                     "GravNet":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d7576f43161214699762f1858e2fc8e2d3112077.mp4",
                     "Annihilation":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/b995bab386bd58541eacfe0e065a808081c0b9ea.mp4"
                 },
    "Fade":  {
                 "Seize":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ed5b27f8f8acf6420d5f0e30938e963a204cfeca.mp4",
                 "Haunt":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/2ee3d74b1105ab3cd996821fb07e4d6aa5c77c1a.mp4",
                 "Prowler":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d401c0074081fd609fa08710174f27fc216c5b92.mp4",
                 "Nightfall":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/fd638db2f5041f8bc09f311af2c460cec579edcd.mp4"
             },
    "Gekko":  {
                  "Wingman":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/e9a92a506942c735f5a986ee9489fad34b192843.mp4",
                  "Dizzy":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/f3a565e0cde441f1754eeadda2427020a795d4a0.mp4",
                  "Mosh Pit":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/85f2c3958091bf4b8fb475c8bda0dcb10a409fbc.mp4",
                  "Thrash":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/fe30846150b8f87f7f945a3f0c82e59d0522dbdc.mp4"
              },
    "Harbor":  {
                   "High Tide":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/1705161e278ec0d669e17e3392ece2cfb3555316.mp4",
                   "Storm Surge":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/e8a2822075831bdda3b1a121a569c61cb865eb59.mp4",
                   "Cove":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/ba5abcf93cae8d9dfacaac56862dd400407d416e.mp4",
                   "Reckoning":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/820946b15b9a68ca46270d44363574dc634b8c1f.mp4"
               },
    "Iso":  {
                "Undercut":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/17503f71b58f654d583a66e29dab75460677576f.mp4",
                "Kill Contract":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/6fbd2b0e16ac3bda095094770ce6b1d403fc3832.mp4",
                "Double Tap":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/11ad2731215ec978c89fdb675aaf3b591c3c3c55.mp4",
                "Contingency":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/5e331c774ffde4e8e0c45a8844b0237b7d75ba3b.mp4"
            },
    "Jett":  {
                 "Updraft":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/4cbc968f05713579aae9464c5a16dc3f6863f943.mp4",
                 "Tailwind":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ec6b3cf1f8ac09d597b0193de1d7bb81335b40e4.mp4",
                 "Cloudburst":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/3353597819f0c032d56ff947d9762368b4ee6c6b.mp4",
                 "Blade Storm":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/667770571300e065b332617e5c8f2e009ed88928.mp4"
             },
    "KAY/O":  {
                  "FRAG/ment":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/292e5319f9cd0aa7eee01af47413f4009236f87e.mp4",
                  "FLASH/drive":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/9ad839fef2fd8d16d9608f8a6efd709091f0b74a.mp4",
                  "ZERO/point":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/dbccb81297a30a9ddc92ec1883c832298f014504.mp4",
                  "NULL/cmd":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d9e35cc5d68e533df2d6e15a93471a5c073b0471.mp4"
              },
    "Killjoy":  {
                    "Nanoswarm":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/b47a0b24d2499935d28f845a067984a52dbc2542.mp4",
                    "ALARMBOT":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/0582e7e1a0733667614492129abef67e17cfc92c.mp4",
                    "TURRET":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/007e5042385d6f7315f4b4cb3fbd3b2c71b530c1.mp4",
                    "Lockdown":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/9485f7bbf04841f4c37e031f07dad03e9cbc1bf9.mp4"
                },
    "Miks":  {
                 "M-pulse":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/71696d85f7392dc2dbbefbf7d6d53b478dd50d1e.mp4",
                 "Waveform":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/aba82134b8cf0f62eb0ba80daa9b6d86380e2348.mp4",
                 "Harmonize":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/7fe1ccd5f450d0e4734c4452cedca5bf6fa818fc.mp4",
                 "Bassquake":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/460f601d6928013be29591766945f2d6bd4759e2.mp4"
             },
    "Neon":  {
                 "High Gear":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a1c82c1a3aa3676bbff05dae9af8fdd8f2f25fb7.mp4",
                 "Relay Bolt":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/db28dddd3cf49297ca4c10c1898e4d3702af9d6f.mp4",
                 "Fast Lane":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/c1ba9d2ec4c567f6b27ddeab512ed245d5706e6b.mp4",
                 "Overdrive":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/917de7be4f9bad96b54f47a4de6f91c323a57a6a.mp4"
             },
    "Omen":  {
                 "Paranoia":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/f401fc788f3182b6d5aa25af6056c842117b1b36.mp4",
                 "Dark Cover":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ba0b035a5ff2bb8d9487ba461b3d15900ff50f6b.mp4",
                 "Shrouded Step":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/33550fee410c5a55ea8832f41827a12aaddb686f.mp4",
                 "From the Shadows":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/252cf8ad86b6aca6210ba93ea856f52708476eba.mp4"
             },
    "Phoenix":  {
                    "Blaze":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/8c5b0e23be0814583ad4601b4297d04dbaff79f7.mp4",
                    "Hot Hands":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/b702ed368fd050e7cb77adf26bc55bb63c5936fb.mp4",
                    "Curveball":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/c62125b1b5637b7b0e0881348502f7e8b8e93572.mp4",
                    "Run it Back":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/aa122a33b1ef0320174991b8ddee4e82dbc2b937.mp4"
                },
    "Raze":  {
                 "Blast Pack":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/82028c5e9ae38b59660dbf9f57f341f1c20c5480.mp4",
                 "Paint Shells":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d75fd65435a84906bb3e8ad0b97c505e7359697b.mp4",
                 "Boom Bot":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/c824fe8e08a4f36be2273aa456819d2c2b6cd6b0.mp4",
                 "Showstopper":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/7281a34566f12d202dee3d43e0fa0bf0b4271d60.mp4"
             },
    "Reyna":  {
                  "Devour":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/327ccef09ef3c84a92320593c5db1bcb4b37e1e7.mp4",
                  "Dismiss":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/6a7db5a37dd8e6e6671699ff30ad297cf1f2eeda.mp4",
                  "Leer":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/01030fba2df618b91c6185bb076f54e8c6c40415.mp4",
                  "Empress":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d777e81e035db1430b1fbf664a432163deed5afb.mp4"
              },
    "Sage":  {
                 "Slow Orb":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/45053483528b96cbe003ac39e6b53c9866d5fea6.mp4",
                 "Healing Orb":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a247d196383136d3de15b4d6d9c816e3c8054ba0.mp4",
                 "Barrier Orb":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a79b1d6838cee5572b428babd74a2db0c07f4ea5.mp4",
                 "Resurrection":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/df83929ed5da349c37a5bf4600c2b55010c72402.mp4"
             },
    "Skye":  {
                 "Trailblazer":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/3256cb83ad3563516497864209ea585c595cd8df.mp4",
                 "Guiding Light":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/64edfd7af8a7125dd9c981c52fdc60f9560b821b.mp4",
                 "Regrowth":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d64273e31bf2c4d16c52acc2f461e9accdb7c7f9.mp4",
                 "Seekers":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/82ab63d9255f9fbbea7c13e00cd46b09ff90d25b.mp4"
             },
    "Sova":  {
                 "Shock Bolt":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/7776fa677e90c72da94ec7d188d2d4618116c41b.mp4",
                 "Recon Bolt":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/50f9d870fa2a9b9ba38408eb718ffc06879c11a8.mp4",
                 "Owl Drone":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/6c6f036376c18ddf4ed0c589b506b8889d86a29a.mp4",
                 "Hunter\u0027s Fury":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/df9ce34c3d2a7f527929cac123501e1473e0da0e.mp4"
             },
    "Tejo":  {
                 "Guided Salvo":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/612a857ad0b5ebfa86611af953066356cd33fe97.mp4",
                 "Special Delivery":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/6fdd2855da57354f3f1d274bea06f8f24140ef23.mp4",
                 "Armageddon":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/8060ca420965ebd775f8cdbe3589600ee5733911.mp4",
                 "Stealth Drone":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/68c56e770855ce32eab9ba4283e4496952295d9a.mp4"
             },
    "Veto":  {
                 "Interceptor":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/e1e6a22165aecb88f0bb8527cfee9e16c6bdc788.mp4",
                 "Crosscut":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/120c1d637aadbeb6995ca80f5819bf9647b9056c.mp4",
                 "Evolution":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/4aafeeffca726a0bfdd0852c0543583dc43da41b.mp4",
                 "Chokehold":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/c20ef1ed8b1ac66589d7be8ce91eb8d238add412.mp4"
             },
    "Viper":  {
                  "Poison Cloud":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/49ff8efd75b76941da3018362061275d3a1d43d6.mp4",
                  "Toxic Screen":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/36db8f44946850c2a20aba43d8ad3ecd977c7d7e.mp4",
                  "Snake Bite":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/9eeb3090efed080792e6ea2f264fd60ebb12694e.mp4",
                  "Viper\u0027s Pit":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/4601fd972c588a79cdd910b2497546f156886c40.mp4"
              },
    "Vyse":  {
                 "Shear":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/bacb07fdf5b13efeab5e24168f8e244257c1d0cb.mp4",
                 "Arc Rose":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/5cefca2b93f097285ce2cb4f20fec7184b555218.mp4",
                 "Razorvine":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/84154b3401b08acad60d739616017a4fcd86710a.mp4",
                 "Steel Garden":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/f9d32afb39a3260b915ea6ef441054c904a69e91.mp4"
             },
    "Waylay":  {
                   "Refract":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/189ff46acf7dd27b245631af9a6c51ef95013bb7.mp4",
                   "Saturate":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/705b3917c26e9e97c5343d57875cd3404537190b.mp4",
                   "Lightspeed":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/e06f520d0e844b3c136623c2568137ac47bc54ff.mp4",
                   "Convergent Paths":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/b04a789382009e666cca021889586c6bc00bbaf5.mp4"
               },
    "Yoru":  {
                 "FAKEOUT":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ef008c8e848a054f88e88f173c03279a45a1c796.mp4",
                 "BLINDSIDE":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/295ab26ef6097d28da0bef9c9b4c6185a80071c8.mp4",
                 "GATECRASH":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/be352287c5704d82d1acbff5ecdee5187755d235.mp4",
                 "DIMENSIONAL DRIFT":  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/9ca7fac6ec9514fa06b9785aad2ead0c3fba0eec.mp4"
             }
};

