import { create } from 'zustand';
import type { ReleaseData, Release } from '../types';
import { buildReleaseData } from '../services/supabase';
import { getReleaseAudioUrl } from '../services/releaseStorage';

interface AppState {
  data: ReleaseData | null;
  loading: boolean;
  error: string | null;
  currentDay: number;
  selectedRelease: Release | null;
  
  // Actions
  fetchData: () => Promise<void>;
  setSelectedRelease: (release: Release | null) => void;
  calculateCurrentDay: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  data: null,
  loading: true,
  error: null,
  currentDay: 0,
  selectedRelease: null,

  fetchData: async () => {
    try {
      set({ loading: true, error: null });

      // --- 1. DEFINE CONTENT OVERRIDES (TITLES & INFO) ---
      // Defined at the top so they apply regardless of data source
      const contentOverrides: Record<number, { title?: string; info?: string }> = {
        1: { 
          title: "We're Going Crazy World", 
          info: `
            <div class="p-4 border border-[var(--color-neon-yellow)]/30 bg-[var(--color-neon-yellow)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-yellow)] mb-2 font-mono">PRODUCTION INFO</h4>
              <p>ONE TAKE FREESTYLE. ONE TAKE AD-LIB .</p>
            </div>
            <div class="p-4 border border-[var(--color-neon-red)]/30 bg-[var(--color-neon-red)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-red)] mb-2 font-mono">SONOTELLER.AI lyrical Analysis</h4>
              <p>The lyrics express a sense of confusion and chaos in the world, reflecting on the shared experience of feeling ′crazy′ and ′hazy.′ The narrator grapples with their emotions, questioning the reasons behind human behavior and the desire for negativity. There is a longing for clarity amidst the madness, as they encourage self-reflection and the pursuit of truth. The song captures a mix of frustration and hope, suggesting that despite the chaos, there is a light within that can guide us. It resonates with listeners who feel overwhelmed by the complexities of life and society.</p>
            </div>
        `
        },

        2: { 
          title: "Shhhhh Bitch feat. Frank", 
          info: `
            <div class="p-4 border border-[var(--color-neon-yellow)]/30 bg-[var(--color-neon-yellow)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-yellow)] mb-2 font-mono">PRODUCTION INFO</h4>
              <p>ONE TAKE FREESTYLE. Hit the hook, 2nd verse and some ad libs. Left space for my friend Frank.</p>
            </div>
            <div class="p-4 border border-[var(--color-neon-red)]/30 bg-[var(--color-neon-red)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-red)] mb-2 font-mono">SONOTELLER.AI lyrical Analysis</h4>
              <p>The lyrics depict a tumultuous relationship marked by violence and emotional turmoil. The narrator addresses a woman caught in a cycle of abuse, urging her to recognize her worth and the toxic nature of her partner. The repeated phrase emphasizes the need for her to listen and reflect on her situation. The song conveys feelings of frustration, anger, and a desire for empowerment, as it highlights the struggles faced by those in abusive relationships. Ultimately, it serves as a call to break free from harmful dynamics and seek a healthier path</p>
            </div>
            <p>this song is about woman who say the want a bad buy whom often end up unhappy with them. Also to point out that nice guys seems to always finish last so the girls should just listen to the correct way, according to my friend Frank for them to live.
          `
        },

        3: { 
          title: "You Like Steve Earle", 
          info: `
            <div class="p-4 border border-[var(--color-neon-yellow)]/30 bg-[var(--color-neon-yellow)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-yellow)] mb-2 font-mono">PRODUCTION INFO</h4>
              <p>One Take cover of You Like Steve Earle by Ronald Meason - my father.</p>
            </div>
            <div class="p-4 border border-[var(--color-neon-red)]/30 bg-[var(--color-neon-red)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-red)] mb-2 font-mono">SONOTELLER.AI lyrical Analysis</h4>
              <p>The lyrics convey a sense of longing and introspection, as the narrator grapples with feelings of connection and the complexities of relationships. The speaker expresses a desire for clarity and understanding, addressing a significant other with sincerity. There is a juxtaposition of joy and melancholy, as the narrator reflects on shared experiences and the importance of companionship. The mention of seeking happiness and the metaphor of a brewery suggests a search for solace in simple pleasures. Overall, the song captures the essence of navigating love and friendship amidst life′s challenges.</p>
            </div>
            <p> When you meet that love of your life late but have some ground rules. A great song penned by my late father Ronald Meason.  I am humbled to try and honor his word and prose.</p>
          `
        },
        4: { 
          title: "We're Only Human by Zillick feat.th3scr1b3", 
          info: `
            <div class="p-4 border border-[var(--color-neon-yellow)]/30 bg-[var(--color-neon-yellow)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-yellow)] mb-2 font-mono">PRODUCTION INFO</h4>
              <p>Brought to my doorstep by my longtime contributing partner Zillick. Structure hook, z, h, z, h, t h. Zillick's parts we're written and required one take when putting them down, my verse and ad-libs freestyle one take, hook purchased with beat.</p>
            </div>
            <div class="p-4 border border-[var(--color-neon-red)]/30 bg-[var(--color-neon-red)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-red)] mb-2 font-mono">SONOTELLER.AI lyrical Analysis</h4>
              <p>The lyrics explore themes of vulnerability and resilience in the face of adversity. The narrator expresses gratitude for a supportive figure who acts as a safety net during difficult times. They reflect on the pain and struggles of life, including feelings of anxiety and judgment from others. The song conveys a sense of longing for understanding and forgiveness, while also acknowledging the harsh realities of human existence. The emotional weight of heartache and the desire for connection are palpable, as the narrator grapples with their own experiences and the impact of others′ words.</p>
            </div>
          `
        },
        // Add more days here...
          5: { 
          title: "Swoop Coupe Phenomenom", 
          info: `
            <div class="p-4 border border-[var(--color-neon-yellow)]/30 bg-[var(--color-neon-yellow)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-yellow)] mb-2 font-mono">PRODUCTION INFO</h4>
              <p>ONE TAKE Freestyle. ONE TAKE AD-LIB.</p>
            </div>
            <div class="p-4 border border-[var(--color-neon-red)]/30 bg-[var(--color-neon-red)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-red)] mb-2 font-mono">SONOTELLER.AI lyrical Analysis</h4>
              <p>The lyrics depict a vibrant and energetic atmosphere, where the narrator expresses a sense of confidence and excitement. The recurring theme of ′swooping′ suggests a carefree attitude towards life and relationships, with imagery of glitter and dancing. The narrator interacts with various characters, emphasizing a playful and flirtatious vibe. Emotions of joy and freedom are prevalent, as the narrator navigates through social situations with ease. The lyrics convey a celebration of individuality and self-expression, inviting listeners to embrace their own unique experiences and enjoy the moment.</p>
            </div>
          `
        },
          6: { 
          title: "Silent Suffocation", 
          info: `
            <div class="p-4 border border-[var(--color-neon-yellow)]/30 bg-[var(--color-neon-yellow)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-yellow)] mb-2 font-mono">PRODUCTION INFO</h4>
              <p>One Take Freestyle Foundation, witrh layered takes of my late father Ron Meason's guitar for a song he wrwote called "Somebody Besides You"</p>
            </div>
            <div class="p-4 border border-[var(--color-neon-red)]/30 bg-[var(--color-neon-red)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-red)] mb-2 font-mono">SONOTELLER.AI lyrical Analysis</h4>
              <p>The lyrics convey a deep sense of longing and emotional turmoil in a relationship. The narrator reflects on past encounters, expressing an overwhelming desire for connection despite the challenges faced. There is a struggle between intense feelings and the fear of losing the other person, leading to a sense of desperation. The imagery of dreams and fire symbolizes passion and the pain of unfulfilled desires. The narrator grapples with the idea of suffocating their wants to cope with the situation, ultimately revealing a complex mix of love, regret, and the hope for reconciliation.</p>
            </div>
          `
        },
          7: { 
          title: "Devour", 
          info: `
            <div class="p-4 border border-[var(--color-neon-yellow)]/30 bg-[var(--color-neon-yellow)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-yellow)] mb-2 font-mono">PRODUCTION INFO</h4>
              <p>ONE TAKE Freestyle. ONE TAKE AD-LIB X2.</p>
            </div>
            <div class="p-4 border border-[var(--color-neon-red)]/30 bg-[var(--color-neon-red)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-red)] mb-2 font-mono">SONOTELLER.AI lyrical Analysis</h4>
              <p>The lyrics convey a sense of euphoric longing and emotional turmoil, exploring themes of desire and the complexities of love. The narrator expresses a deep yearning for connection, feeling both exhilarated and lost in the intensity of their emotions. The imagery of tasting and devouring suggests a passionate relationship that is both fulfilling and consuming. Despite the highs of love, there is an underlying sense of isolation and confusion, as the narrator grapples with their identity and the passage of time. The song captures the duality of pleasure and pain in romantic entanglements.</p>
            </div>
          `
        },
          8: { 
          title: "Poetry", 
          info: `
            <div class="p-4 border border-[var(--color-neon-yellow)]/30 bg-[var(--color-neon-yellow)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-yellow)] mb-2 font-mono">PRODUCTION INFO</h4>
              <p>ONE TAKE Freestyle</p>
            </div>
            <div class="p-4 border border-[var(--color-neon-red)]/30 bg-[var(--color-neon-red)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-red)] mb-2 font-mono">SONOTELLER.AI lyrical Analysis</h4>
              <p>The lyrics explore the transformative power of poetry as a means of self-expression and connection. They emphasize the importance of articulating one′s thoughts and emotions, suggesting that poetry can bridge gaps in understanding and foster empathy among individuals. The song reflects on the struggles of conveying inner experiences, highlighting the contrast between personal narratives and external perceptions. It acknowledges the challenges faced in life, including the influence of substances, while advocating for authenticity and vulnerability in sharing one′s story. Ultimately, it celebrates the unifying nature of poetry as a shared human experience.</p>
            </div>
          `
        },
         9: { 
          title: "Without You", 
          info: `
            <div class="p-4 border border-[var(--color-neon-yellow)]/30 bg-[var(--color-neon-yellow)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-yellow)] mb-2 font-mono">PRODUCTION INFO</h4>
              <p>ONE TAKE FREESTYLE. ONE TAKE AD-LIB.</p>
            </div>
            <div class="p-4 border border-[var(--color-neon-red)]/30 bg-[var(--color-neon-red)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-red)] mb-2 font-mono">SONOTELLER.AI lyrical Analysis</h4>
              <p>The lyrics convey a deep sense of loss and longing for someone who has been a crucial part of the narrator′s life. The emotional weight of missing this person is palpable, as the narrator struggles to find brightness in their days and feels incomplete without them. Memories flood in, but they are tinged with sadness, highlighting the impact of the absence. The recurring theme of needing support to overcome personal demons emphasizes vulnerability and the struggle to cope with grief. Ultimately, the song captures the profound emptiness and emotional turmoil that accompanies losing a significant connection.</p>
            </div>
          `
        },
         10: { 
          title: "Long Haul", 
          info: `
            <div class="p-4 border border-[var(--color-neon-yellow)]/30 bg-[var(--color-neon-yellow)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-yellow)] mb-2 font-mono">PRODUCTION INFO</h4>
              <p>ONE TAKE FREESTYLE</p>
            </div>
            <div class="p-4 border border-[var(--color-neon-red)]/30 bg-[var(--color-neon-red)]/10 rounded mb-4">
              <h4 class="font-bold text-[var(--color-neon-red)] mb-2 font-mono">SONOTELLER.AI lyrical Analysis</h4>
              <p>The lyrics explore the complexities of relationships and the struggles of life, emphasizing that nothing worthwhile comes easily. The narrator expresses a commitment to support a friend through challenges, highlighting themes of resilience and camaraderie. There is a sense of urgency to break free from societal constraints and superficiality, urging the listener to embrace authenticity and connection. The emotional tone oscillates between determination and vulnerability, reflecting the desire for understanding and companionship amidst life′s chaos. Ultimately, the message is one of solidarity and the importance of being there for one another in difficult times.</p>
            </div>
          `
        },


      };

      // --- 2. LOAD DATA SOURCES ---
      
      // A) Load manifest
      let manifest: { items: Array<{ month: string; index: number; storageTitle: string; ext: string; audioPath: string }> } | null = null;
      try {
        const mres = await fetch('/release-manifest.json');
        if (mres.ok) {
          manifest = await mres.json();
          console.log('[Store] Loaded manifest with', manifest?.items?.length || 0, 'items');
        }
      } catch (e) {
        console.warn('[Store] Failed to load manifest:', e);
      }
      
      // B) Remote metadata
      let dataToUse: ReleaseData | null = null;
      try {
        const supabaseData = await buildReleaseData();
        
        if (manifest && manifest.items?.length) {
            // MANIFEST PATH: Reconstruct data based on manifest order
            const remoteReleases = supabaseData.releases || [];
            
            const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
            const stripLeadingNumber = (s: string) => s.replace(/^\d+[\s-_]+/, '');

            const manualOverrides: Record<string, string> = {
              "chunky": "chunkynewm",
              "dream": "dreammastered",
              "whatitis": "whatitis",
              "peacefullypeace": "peacefullypeace2",
              "openwide": "openwide",
              "onsight": "onsight",
              "monetary": "monetary2121",
              "getnaughty": "getnaughty",
              "getitin": "getitin",
              "wishingwell": "wishingwell23mixdown",
              "wishiwasdead": "wishiwasdead",
              "unloved": "unloved",
              "spaces": "spaces",
              "sayitup": "sayitup",
              "killingme": "killingme",
              "unforgettable": "unforgettable",
              "highup": "highup",
              "faraway": "faraway",
              "fundrip": "fundripexhale",
              "astopintime": "astopintime",
              "demonsoul": "demonsoul",
              "maybebabyittsonme": "maybebabyittsonme",
              "olbremix": "olbremixuntitled12mastered",
              "adrift": "adrift",
              "noservice": "noservice",
              "speedofpain": "speedofpain",
              "throughtheringer": "throughtheringer",
              "climbtoyou": "climbtoyouth3scr1b3afterlife",
              "onebyeone": "onebyeoneth3scr1b3afterlife",
              "trip": "tripth3scr1b3afterlife",
              "comeondance": "comeondance",
              "emotuionalhealingmas": "emotuionalhealingmas",
              "grenada": "grenadasr",
              "liveforefeatxzibit": "liveforeverfeatxzibit",
              "pulse": "pulse",
              "odosed": "overdosedmas",
              "dreamsagain": "dreamsagain",
              "undercoa4": "undercovera4masteredwithclearskyat100pct",
              "myway": "mywayrelaymmastered",
              "hardtoignore": "hard2ignore",
              "fastlife": "fastlife2",
              "dontblameu": "dontblameumix5masteredwithsunroofat100pct",
              "byebi": "byebi2mastered",
              "bettersionofme": "betterversionofme",
              "cantescapemas": "cantescapemasprecisedepthpresence4824",
              "cursed2ndmix": "cursed2ndmix",
              "climax": "climaxmas",
              "behereboo": "behereboo",
              "awaits": "awaits",
              "yourchoice": "yourchoice",
              "openallnight": "openallnightver2",
              "littlelight": "littlelight",
              "ifyoucomealong": "ifyoucomealong",
              "gasp": "gaspdownload",
              "dandd": "dandd",
              "luckyland": "luckyland",
              "luckylandreprise": "luckylandreprise",
              "longhaul": "longhaul",
              "mondaytawendaytafriday": "mondaytawendaytafridayrelay",
              "cometogether": "cometogether",
              "starshining": "starshining",
              "tightrope": "tightrope2mastered",
              "triedntrue": "triedntrue",
              "loss": "loss",
              "lightburst": "lightburstmastered",
              "malibu": "malibu",
              "sirens": "sirens",
              "filthy": "filthy",
              "hhhhhhhhhhhhh": "hhhhhhhhhhhhh",
              "midnightpiano": "midnightpianoth3scr1b3afterlife",
              "whyulie": "whyulieth3scr1b3afterlife",
              "xzibitforever": "xzinbitforever",
              "whatisgodwithootme": "whatisgodwithootme",
              "breakingme": "breakingmem",
              "gogetit": "gogetitm",
              "graverobber": "graverobber",
              "mikeym": "mikeym",
              "nicksnuffm3": "nicksnuffm3",
              "onlyson": "onlyson",
              "poetry": "poetry",
              "prevail": "prevail",
              "prevailscriber": "prevailmscriber",
              "summersending": "summersending",
              "stamerica": "stamericamixdown",
              "shesaidlilrichardwheredafuxu": "shesaidlilrichardwheredafuxumixdown",
              "momentofexctasy": "momentofexctasy320",
              "flyawayagain": "flyawayagainmixdown",
              "upallnight": "copyofupallnight",
              "purepopped": "copyofpurepopped",
              "cheatcode": "cheatcode2",
              "fromtheearthtotheseaflippedmask": "fromtheearthtotheseaflippedmaskmastered",
              "sicko": "sicko",
              "cantgoback": "cantgoback",
              "onelastbreath3": "onelastbreathmastered3",
              "darkthoughts": "darkthoughts",
              "brave": "brave",
              "dontghostme": "dontghostme",
              "whatyouknow": "whatyouknow",
              "whatuwant": "whatuwant",
              "teamo": "teamo",
              "ngbt1": "ngbt12",
              "naturaldisaster": "naturaldisaster",
              "monetaryt": "monetaryt",
              "kurtcobain": "kurtcobain",
              "jacyb": "jacy24b",
              "getghost": "getghost",
              "isitthathard": "isitthathardcyrom",
              "purpose": "purpose",
              "wastedbywhat": "wastedbywhat",
              "canthave": "canthavemyballs",
              "faintcopy": "faintcopy",
              "believinginjust": "believinginjust",
              "isolkated": "isolkated",
              "brightday": "brightdaymastered",
              "taintedgospal": "gchauvinfloydtaintedgospalwsimastered",
              "surrendertou": "surrendertou2",
              "sodone": "sodonetemplate",
              "80sstack": "80sstackabbyroad",
              "dashboardoflife": "dashboardoflife",
              "thelight": "thelightcover",
              "complicateds": "complicatedsth3scr1b3afterlife",
              "blackout": "blackoutth3scr1b3afterlife",
              "lowlife": "lowlifeth3scr1b3afterlife",
              "feelit": "feelitth3scr1b3afterlife",
              "whenisayforever": "whenisayforeverth3scr1b3afterlife",
              "airwavesfeatzillick": "airwavesfeatzillickth3scr1b3afterlife",
              "gettingbetter": "gettingbetterth3scr1b3afterlife",
              "weregoingcrazyworld": "weregoingcrazyworld",
              "awaygoes": "awaygoes",
              "benuter": "benuterm",
              "belong": "belongm",
              "footsteps": "footstepsmas",
              "fuckb": "fuckbm",
              "hatedown": "hatemixdown",
              "johnnydemon": "johnnydemonm",
              "shhhbitch": "shhhbitch",
              "friendzone": "friendzone",
              "falllin": "falllin",
              "againstthegrain": "againstthegrain2",
              "wayeightforedatstormlevel": "wayeightforedatstormlevel2",
              "rabbithole": "rabbithole",
              "lockedup": "lockedupmasteredwithsunroofat65pct",
              "entropy": "entropynormal2",
              "consationw": "conversationwm",
              "tripintobackground": "tripintobackground",
              "benefitsme": "benefitsme",
              "darewell": "darewell",
              "comearoundpersiuin": "dsbangerz4comearoundpersiuin",
              "choppmedoffyafeelrough": "choppmedoffyafeelrough",
              "swoopedcoupe": "swoopedcoupe",
              "leftonred": "leftonred",
              "gethighwithme": "gethighwmemixdown",
              "feelgood": "feelgood",
              "hades": "hades",
              "toolatefawy": "toolatefawymastered",
              "talkinnody": "talkinnodycover",
              "notgoodenough": "notgoodenough",
              "agirl": "agirl",
              "addicted": "addicted",
              "nostalgicenergby": "nostalgicenergby",
              "unifying": "unifyingmastered",
              "nosticheresy": "gchauvinfloydnosticheresybsidemastered",
              "haertnsoulcollide": "haertnsoulcollide",
              "comealongwithme": "comealongwithmemastered",
              "flickerlikefire": "flickerlikefire",
              "maybebaby": "maybebaby",
              "neverends": "neverends",
              "olbremix2": "olbremixuntitled12mastered2",
              "yourealwatsonmymind": "yourealwatsonmymind",
              "itsgonnabealright": "itsgonnabealrightsat",
              "onlytimewilltell": "otwtrealscr1b3mix",
              "sometimes": "sometimessplittermas",
              "econtime": "econtimeth3scr1b3afterlife",
              "beauty": "beautyth3scr1b3afterlife",
              "reality": "realityth3scr1b3afterlife",
              "whatbryanwasworkingonlast": "whatbryanwasworkingonlastth3scr1b3afterlife",
              "spippin": "spippinth3scr1b3afterlife",
              "wysiwyg": "wysiwygmas",
              "yougotme": "yougotmem",
              "alien2ndmix": "alien2ndmix",
              "burningitdowncomd2": "burningitdowncovermd2",
              "climbing2u": "climbing2uneews",
              "coldasice": "coldasicem",
              "goods4me": "goods4memastered",
              "negonnasstoplovingyou": "nevergonnasstoplovingyou",
              "noplace2hide": "noplace2hide",
              "scarsinmymind": "scarsinmymindm",
              "trippie": "trippiefeatrittz",
              "leavemedead": "leavemedead48000",
              "aborted": "dssbangerz2aborted",
              "devour": "devour",
              "re": "replace",
              "hemmorage": "hemmorage1",
              "untied": "untied",
              "diamonddeath": "diamonddeath",
              "wereonlyhumanmd7": "wereonlyhumanmd7",
              "mythical": "mythicalth3scr1b3afterlife",
              "mypast": "mypastth3scr1b3afterlife",
              "purplesky": "purpleskyth3scr1b3afterlife",
              "flowersofus": "flowersofusth3scr1b3afterlife",
              "alf": "alfm2",
              "fallingapart": "fallingapartm",
              "grinnada": "grinnadam",
              "sau": "mastersau",
              "odds": "oddsmas",
              "oldensideofyou": "oldensideofyou",
              "outlast": "outlastmas",
              "pop": "pop1",
              "pitwhatigot": "pitwhatigot",
              "youlikesteveearle": "youlikesteveearlemastered1",
              "quitethelie1": "quitethelie1masteredwithsunroofat100pct",
              "nomatterthepain": "nomatterthepain2",
              "findherdemoentiremix": "findherdemomasterentiremixbounced",
              "burnittothegroundgapless": "burnittothegroundmastergapless",
              "afinesinremix": "afinesinremix3",
              "aweofu": "aweofu",
              "selfdick": "selfdickmas",
              "backroads": "backroads",
              "basic": "basicmas",
              "abandon": "abandon",
              "clebit": "cleverbit",
              "dreamsshattered": "dreamsshattered",
              "sunset": "sunset",
              "starlight": "starlight",
              "singtome": "singtome",
              "truelies": "truelies",
              "tryied": "tryied",
              "yourbody": "yourbody3",
              "camebackaroudnd": "camebackaroudnd",
              "worldending": "worldending",
              "tobeaman": "tobeaman",
              "theend": "theendfeatkvon",
              "sweater": "sweater",
              "savetonight": "savetonight",
              "riddle": "riddle",
              "poth": "poth",
              "mysacrifices": "mysacrifices",
              "mystery": "mystery",
              "sstakeone": "sstakeone",
              "message4kcompm1": "message4kcompm1",
              "getoyou": "getoveryouineedmaster",
              "bealtm": "bealtm",
              "bitterbetter": "bitterbetter",
              "landrdancefloorbalancedmedium": "landrdancefloorbalancedmedium",
              "tomyself": "tomyself",
              "landrhemmorage1openmedium": "landrhemmorage1openmedium",
              "landrchildhoodwarmlow": "landrchildhoodwarmlow",
              "landrscarsinmymindmbalancedmedium": "landrscarsinmymindmbalancedmedium",
              "landrloveforyoubalancedmedium": "landrloveforyoubalancedmedium",
              "landrselfdickmasbalancedmedium": "landrselfdickmasbalancedmedium",
              "4u": "4u",
              "landrsmoothiebalancedmedium": "landrsmoothiebalancedmedium",
              "landrawayoutmasbalancedmedium": "landrawayoutmasbalancedmedium",
              "standingone": "standingone",
              "landrsweetyouwarmmedium": "landrsweetyouwarmmedium",
              "landrwantitanyotherwayopenlow": "landrwantitanyotherwayopenlow",
              "doubleagent": "doubleagent",
              "changeperception": "changeperceptionm",
              "running": "runningmas",
              "itwonttakelolng": "itwonttakelolng",
              "missingyou": "missingyou",
              "exhale": "exhale",
              "figures": "figures",
              "advice2": "copyofadvice2masteredwithauroraat100pct",
              "dirtroad": "dirtroad",
              "lifesuccubus": "lifesuccubus",
              "bb": "bb33m",
              "buckimhereytofuck": "buckimhereytofuck",
              "wrapthat": "wrapthatm",
              "youknowyou2e": "youknowyou2e",
              "shawtynotahottie": "shawtynotahottiefreesyleadlib",
              "paidtheworldbackbeat": "paidtheworldbackbeat",
              "afinesin": "afinesin",
              "letitgo": "letitgo",
              "landrstayandigobalancedmedium": "landrstayandigobalancedmedium",
              "echoesoftheabyssvotd": "echoesoftheabyssvotd",
              "fml": "fml",
              "lightgoesin": "lightgoesin",
              "mylight": "mylight",
              "lovecarries": "lovecarries",
              "hangingaround": "hangingaround",
              "problems": "problems",
              "getthrfuckoutaml": "getthrfuckoutaml",
              "ihadsomehelp": "ihadsomehelp",
              "letitflow0": "letitflow0",
              "hopeandfaith": "hopeandfaith",
              "rainisitthathardintro": "rainisitthathardintro",
              "fuckingwitme": "fuckingwitme",
              "searchingforfree": "searchingforfree",
              "withoutyoucyro": "withoutyoucyro",
              "2croissroads": "2croissroads",
              "getdownwiththenegative": "getdownwiththenegative",

              // Days 349-365 (System Log files)
              "systemcrashlog349": "systemcrash",
              "memoryoverflowlog350": "memoryoverflow",
              "recursivelooplog351": "recursiveloop",
              "stacktracelog352": "stacktrace",
              "nullpointerlog353": "nullpointer",
              "segmentationfaultlog354": "segmentationfault",
              "bufferoverflowlog355": "bufferoverflow",
              "threaddeadlocklog356": "threaddeadlock",
              "heapcorruptionlog357": "heapcorruption",
              "infiniterecursionlog358": "infiniterecursion",
              "mutexpoisonedlog359": "mutexpoisoned",
              "pipebrokenlog360": "pipebroken",
              "signalabortlog361": "signalabort",
              "accessviolationlog362": "accessviolation",
              "pagefaultlog363": "pagefault",
              "sigsegvreceivedlog364": "sigsegvreceived",
              "coredumpedlog365": "coredumped"
            };

            const byTitle = new Map(remoteReleases.map(r => [normalize(r.storageTitle || r.title), r]));
            const byFile = new Map(remoteReleases.map(r => {
              const fn = r.storedAudioUrl ? decodeURIComponent(r.storedAudioUrl.split('/').pop() || '') : '';
              let base = fn.replace(/\.(wav|mp3|m4a|flac)$/i, '');
              base = stripLeadingNumber(base);
              return [normalize(base), r];
            }));

            const offsets: Record<string, number> = { january:0,february:31,march:59,april:90,may:120,june:151,july:181,august:212,september:243,october:273,november:304,december:334 };

            const remapped = manifest.items.map((it) => {
              // Matching Logic
              const cleanStorageTitle = stripLeadingNumber(it.storageTitle);
              const keyTitle = normalize(cleanStorageTitle);
              let searchKey = manualOverrides[keyTitle] || keyTitle;
              let match = byTitle.get(searchKey) || byFile.get(searchKey);

              if (!match) {
                match = remoteReleases.find(r => {
                    const rTitle = normalize(r.storageTitle || r.title);
                    return rTitle.includes(searchKey) || searchKey.includes(rTitle);
                });
              }

              const absDay = (offsets[it.month] ?? 0) + it.index;
              const startDate = new Date('2026-01-01');
              const d = new Date(startDate);
              d.setDate(startDate.getDate() + absDay - 1);
              const correctDateStr = d.toISOString().split('T')[0];
              const correctAudioUrl = getReleaseAudioUrl(absDay, it.storageTitle, it.month, it.ext);

              if (match) {
                return {
                  ...match,
                  day: absDay,
                  date: correctDateStr,
                  storageTitle: it.storageTitle,
                  manifestAudioPath: it.audioPath,
                  storedAudioUrl: correctAudioUrl,
                } as Release;
              }
              
              // Fallback
              return {
                id: `${it.month}-${it.index}`,
                day: absDay,
                date: correctDateStr,
                fileName: `${String(it.index).padStart(2,'0')} - ${it.storageTitle}.${it.ext}`,
                title: it.storageTitle,
                storageTitle: it.storageTitle,
                manifestAudioPath: it.audioPath,
                storedAudioUrl: correctAudioUrl,
                mood: 'light',
                description: '',
                duration: 0,
                durationFormatted: '0:00',
                tempo: 0,
                key: 'C major',
                energy: 0.5,
                valence: 0.5,
                genre: [],
                tags: [],
              } as Release;
            });

            dataToUse = { 
              ...supabaseData, 
              releases: remapped,
              stats: { ...supabaseData.stats, totalReleases: remapped.length }
            };
        } else if (supabaseData.releases && supabaseData.releases.length > 0) {
          dataToUse = supabaseData;
        }
      } catch (e) {
        console.warn('Error fetching remote data:', e);
      }
      
      // C) Local/Static Fallback if data is still null
      if (!dataToUse) {
        console.log('[Store] Remote returned no data, checking local...');
        let response = await fetch('/releases.local.json');
        if (!response.ok) response = await fetch('/releases.json');
        
        if (response.ok) {
          dataToUse = await response.json();
        }
      }

      // --- 3. FINAL PROCESSING: APPLY OVERRIDES ---
      // This runs regardless of where the data came from (Manifest, Supabase, or Local JSON)
      if (dataToUse) {
        dataToUse.releases = dataToUse.releases.map(release => {
          const overrides = contentOverrides[release.day];
          if (overrides) {
            return {
              ...release,
              title: overrides.title || release.title,
              customInfo: overrides.info || release.customInfo,
            };
          }
          return release;
        });

        set({ data: dataToUse, loading: false });
        get().calculateCurrentDay();
      } else {
        throw new Error('No data available');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  setSelectedRelease: (release) => set({ selectedRelease: release }),

  calculateCurrentDay: () => {
    const { data } = get();
    if (!data) return;
    const localStart = new Date(`${data.project.startDate}T00:00:00`);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const elapsedDays = Math.floor((now.getTime() - localStart.getTime()) / msPerDay);
    const dayNumber = elapsedDays + 1;
    set({ currentDay: Math.max(1, Math.min(dayNumber, 365)) });
  },
}));