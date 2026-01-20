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

      // 1) Load manifest
      let manifest: { items: Array<{ month: string; index: number; storageTitle: string; ext: string; audioPath: string }> } | null = null;
      try {
        const mres = await fetch('/release-manifest.json');
        if (mres.ok) manifest = await mres.json();
      } catch (e) { console.warn('[Store] Failed to load manifest:', e); }
      
      // 2) Remote metadata
      const supabaseData = await buildReleaseData();
      let dataToUse: ReleaseData | null = null;
      
      if (manifest && manifest.items?.length) {
          const remoteReleases = supabaseData.releases || [];
          const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
          const stripLeadingNumber = (s: string) => s.replace(/^\d+[\s-_]+/, '');

          // --- CONTENT OVERRIDES (CUSTOM TITLES & INFO) ---
          // Format: DayNumber: { title: "New Title", info: "<p>HTML Content</p>" }
          const contentOverrides: Record<number, { title?: string; info?: string }> = {
            1: { 
              title: "The Beginning (Day One)", 
              info: "<p>This was the very first track created for the project. <strong>It sets the tone</strong> for the entire year.</p>" 
            },
            18: { 
              title: "Goods 4 Me", 
              info: `
                <div class="p-4 border border-green-500/30 bg-green-500/10 rounded">
                  <h4 class="font-bold text-green-400 mb-2">Production Note</h4>
                  <p>I utilized a new sampling technique here that distorts the vocal chop into a rhythmic element.</p>
                </div>
              `
            },
            // Add more days here as needed...
          };

          // --- FUZZY MATCHING OVERRIDES (Filename Mapping) ---
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

            // Days 349-365 (System Log files - Preserved)
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

          // Build Lookup Maps
          const byTitle = new Map(remoteReleases.map(r => [normalize(r.storageTitle || r.title), r]));
          const byFile = new Map(remoteReleases.map(r => {
            const fn = r.storedAudioUrl ? decodeURIComponent(r.storedAudioUrl.split('/').pop() || '') : '';
            let base = fn.replace(/\.(wav|mp3|m4a|flac)$/i, '');
            base = stripLeadingNumber(base);
            return [normalize(base), r];
          }));

          const offsets: Record<string, number> = { january:0,february:31,march:59,april:90,may:120,june:151,july:181,august:212,september:243,october:273,november:304,december:334 };

          const remapped = manifest.items.map((it) => {
            // 1. Matching Logic
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

            // --- APPLY CONTENT OVERRIDES HERE ---
            let displayTitle = it.storageTitle;
            let displayInfo = undefined;
            if (contentOverrides[absDay]) {
                if (contentOverrides[absDay].title) displayTitle = contentOverrides[absDay].title;
                if (contentOverrides[absDay].info) displayInfo = contentOverrides[absDay].info;
            }

            if (match) {
              return {
                ...match,
                day: absDay,
                date: correctDateStr,
                
                // FIX: Use the calculated display variables here!
                title: displayTitle, // Was: it.storageTitle
                customInfo: displayInfo, // Was: missing entirely
                
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
              title: displayTitle, // Use custom or manifest title
              customInfo: displayInfo, // Inject custom info
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
      
      if (dataToUse) {
        set({ data: dataToUse, loading: false });
        get().calculateCurrentDay();
        return;
      }
      
      // Local/Static Fallback
      let response = await fetch('/releases.local.json');
      if (!response.ok) response = await fetch('/releases.json');
      if (response.ok) {
        const data: ReleaseData = await response.json();
        set({ data, loading: false });
        get().calculateCurrentDay();
        return;
      }
      throw new Error('No data available');
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