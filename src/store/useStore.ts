import { create } from 'zustand';
import type { ReleaseData, Release } from '../types';
import { buildReleaseData } from '../services/supabase';

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

      // 1) Load manifest (defines audio + order from local 365-releases)
      let manifest: { items: Array<{ month: string; index: number; storageTitle: string; ext: string; audioPath: string }> } | null = null;
      try {
        const mres = await fetch('/release-manifest.json');
        if (mres.ok) {
          manifest = await mres.json();
          console.log('[Store] Loaded release-manifest with', manifest?.items?.length || 0, 'items');
        }
      } catch (e) {
        console.warn('[Store] Failed to load manifest:', e);
      }
      
      // 2) Remote analyzer metadata
      console.log('[Store] Fetching data from Supabase (remote)…');
      const supabaseData = await buildReleaseData();
      let dataToUse: ReleaseData | null = null;
      
      if (manifest && manifest.items?.length) {
          // Manifest-first: build the releases in EXACT manifest order
          const remoteReleases = supabaseData.releases || [];
          
          // --- MATCHING HELPERS ---
          const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
          const stripLeadingNumber = (s: string) => s.replace(/^\d+[\s-_]+/, '');

          // --- MANUAL OVERRIDES (Based on your logs) ---
          // Left side: Manifest Title (normalized)
          // Right side: Database Title/Filename (normalized)
          const manualOverrides: Record<string, string> = {
            // Day 3
            "youlikesteveearle": "kindofgirl", 
            // Day 9
            "withoutyou": "withoutyou",
            // Day 10
            "permissiondeniedlog108": "permissiondenied",
            // Day 11
            "gettingbetter": "itsnotalwayseasy",
            // Day 14
            "undercoa4": "undercover",
            // Day 15
            "whatbryanwasworkingonlast": "whatbryanwasworkingonlast", // Should match fuzzy
            // Day 16
            "prevailscriber": "prevail", 
            // Day 18
            "goods4me": "goodsforme",
            // Day 22
            "rebootsequencelog109": "rebootsequence",
            // Day 25
            "grenada": "grenada", 
            // Day 27
            "talkinnody": "talkinnobody",
            // Day 31
            "scarsinmymind": "scarsinmymind", 
            // Day 33
            "bettersionofme": "betterversionofme",
            // Day 34
            "consationw": "conversationw",
            // Day 36
            "404soulnotfoundlog101": "404soulnotfound",
            // Day 38
            "econtime": "economictime", 
            // Day 40
            "wayeightforedatstormlevel": "waybeforethatstormlevel",
            // Day 41
            "benuter": "beneuter",
            // Day 42
            "xzibitforever": "xzibitforever",
            // Day 50
            "daemonrunninglog102": "daemonrunning",
            // Day 51
            "changeperception": "changeperception",
            // Day 53
            "theend": "theend",
            // Day 59
            "reality": "reality",
            // Day 61
            "re": "re",
            // Day 64
            "connectionresetlog100": "connectionreset",
            // Day 68
            "fromtheearthtotheseaflippedmask": "fromtheearthtothesea",
            // Day 70
            "sau": "sau",
            // Day 72
            "isitthathard": "isitthathard",
            // Day 74
            "lowlife": "lowlife",
            // Day 75
            "pingtimeoutlog106": "pingtimeout",
            // Day 79
            "lightburst": "lightburst",
            // Day 80
            "monetary": "monetary",
            // Day 82
            "adminaccessrequiredlog107": "adminaccessrequired",
            // Day 83
            "jacyb": "jacyb",
            // Day 85
            "odosed": "overdosed",
            // Day 88
            "cheatcode": "cheatcode",
            // Day 89
            "peacefullypeace": "peacefully",
            // Day 91
            "uploadingconsciousnesslog134": "uploadingconsciousness",
            // Day 92
            "kernelpaniclog135": "kernelpanic",
            // Day 93
            "installingupdateslog136": "installingupdates",
            // Day 94
            "pop": "pop",
            // Day 95
            "404soulnotfoundlog124": "404soulnotfound",
            // Day 96
            "dream": "dream",
            // Day 97
            "coldasice": "coldasice",
            // Day 98
            "unifying": "unifying",
            // Day 99
            "daemonrunninglog128": "daemonrunning",
            // Day 102
            "adminaccessrequiredlog114": "adminaccessrequired",
            // Day 103
            "myway": "myway",
            // Day 105
            "gasp": "gasp",
            // Day 106
            "nomatterthepain": "nomatterthepain",
            // Day 107
            "decryptingfileslog119": "decryptingfiles",
            // Day 108
            "uploadingconsciousnesslog138": "uploadingconsciousness",
            // Day 111
            "memoryleaklog126": "memoryleak",
            // Day 113
            "onebyeone": "onebyone",
            // Day 114
            "uploadingconsciousnesslog131": "uploadingconsciousness",
            // Day 115
            "afinesinremix": "afinesin",
            // Day 116
            "quitethelie1": "quitethelie",
            // Day 118
            "gethighwithme": "gethighwithme",
            // Day 119
            "endoflinelog121": "endofline",
            // Day 120
            "selfdick": "selfdick",
            // Day 121
            "taintedgospal": "taintedgospel",
            // Day 122
            "systemoverheatlog118": "systemoverheat",
            // Day 123
            "burnittothegroundgapless": "burnittotheground",
            // Day 125
            "pingtimeoutlog117": "pingtimeout",
            // Day 126
            "whyulie": "whyulie",
            // Day 127
            "purepopped": "purepopped",
            // Day 128
            "tracingroutetogodlog112": "tracingroutetogod",
            // Day 129
            "cantescapemas": "cantescape",
            // Day 130
            "airwavesfeatzillick": "airwaves",
            // Day 131
            "syntaxerrorinlifelog110": "syntaxerrorinlife",
            // Day 133
            "syntaxerrorinlifelog120": "syntaxerrorinlife",
            // Day 134
            "byebi": "byebye",
            // Day 135
            "bufferingrealitylog133": "bufferingreality",
            // Day 138
            "olbremix2": "olbremix",
            // Day 140
            "comearoundpersiuin": "comearoundpersuasion",
            // Day 141
            "nosticheresy": "gnosticheresy",
            // Day 144
            "rebootsequencelog111": "rebootsequence",
            // Day 145
            "tracingroutetogodlog137": "tracingroutetogod",
            // Day 146
            "grinnada": "grenada",
            // Day 148
            "breakingme": "breakingme",
            // Day 149
            "landrburningitdowncobalancedmedium": "burningitdown",
            // Day 150
            "filecorruptedlog122": "filecorrupted",
            // Day 151
            "packetlossdetectedlog130": "packetlossdetected",
            // Day 152
            "aborted": "aborted",
            // Day 153
            "diskfragmentationlog123": "diskfragmentation",
            // Day 154
            "connectionresetlog139": "connectionreset",
            // Day 155
            "fastlife": "fastlife",
            // Day 156
            "shawtynotahottie": "shawtynotahottie",
            // Day 157
            "memoryleaklog132": "memoryleak",
            // Day 160
            "filecorruptedlog113": "filecorrupted",
            // Day 161
            "wishingwell": "wishingwell",
            // Day 162
            "packetlossdetectedlog125": "packetlossdetected",
            // Day 164
            "olbremix": "olbremix",
            // Day 166
            "brightday": "brightday",
            // Day 170
            "rebootsequencelog115": "rebootsequence",
            // Day 173
            "systemoverheatlog127": "systemoverheat",
            // Day 174
            "landrcryinglilbitchbalancedmediumrev": "cryinglilbitch",
            // Day 175
            "mondaytawendaytafriday": "mondaytowednesdaytofriday",
            // Day 177
            "leavemedead": "leavemedead",
            // Day 178
            "permissiondeniedlog116": "permissiondenied",
            // Day 179
            "flyawayagain": "flyawayagain",
            // Day 182
            "onelastbreath3": "onelastbreath",
            // Day 183
            "againstthegrain": "againstthegrain",
            // Day 185
            "trippie": "trippie",
            // Day 189
            "fundrip": "fundrip",
            // Day 190
            "sometimes": "sometimes",
            // Day 191
            "memoryleaklog149": "memoryleak",
            // Day 199
            "surrendertou": "surrendertoyou",
            // Day 200
            "endoflinelog145": "endofline",
            // Day 206
            "findherdemoentiremix": "findher",
            // Day 210
            "feelit": "feelit",
            // Day 211
            "packetlossdetectedlog146": "packetlossdetected",
            // Day 217
            "landrifyouleave0openlow": "ifyouleave",
            // Day 218
            "filecorruptedlog140": "filecorrupted",
            // Day 219
            "flowersofus": "flowersofus",
            // Day 220
            "canthave": "canthave",
            // Day 221
            "footsteps": "footsteps",
            // Day 222
            "syntaxerrorinlifelog144": "syntaxerrorinlife",
            // Day 223
            "filecorruptedlog147": "filecorrupted",
            // Day 224
            "complicateds": "complicated",
            // Day 227
            "connectionresetlog141": "connectionreset",
            // Day 229
            "daemonrunninglog148": "daemonrunning",
            // Day 230
            "liveforefeatxzibit": "livefore",
            // Day 231
            "systemoverheatlog143": "systemoverheat",
            // Day 232
            "ngbt1": "ngbt",
            // Day 238
            "tracingroutetogodlog142": "tracingroutetogod",
            // Day 245
            "permissiondeniedlog150": "permissiondenied",
            // Day 246
            "hemmorage": "hemmorage",
            // Day 249
            "blackout": "blackout",
            // Day 251
            "running": "running",
            // Day 252
            "fuckb": "fuckb",
            // Day 253
            "getoyou": "gettoyou",
            // Day 254
            "onlytimewilltell": "onlytimewilltell",
            // Day 257
            "midnightpiano": "midnightpiano",
            // Day 258
            "johnnydemon": "johnnydemon",
            // Day 260
            "purplesky": "purplesky",
            // Day 265
            "toolatefawy": "toolateforyou",
            // Day 266
            "clebit": "clebit",
            // Day 270
            "fallingapart": "fallingapart",
            // Day 274
            "outlast": "outlast",
            // Day 275
            "bufferingrealitylog164": "bufferingreality",
            // Day 276
            "bufferingrealitylog162": "bufferingreality",
            // Day 279
            "hatedown": "hatedown",
            // Day 283
            "endoflinelog166": "endofline",
            // Day 285
            "kernelpaniclog156": "kernelpanic",
            // Day 286
            "kernelpaniclog158": "kernelpanic",
            // Day 287
            "installingupdateslog163": "installingupdates",
            // Day 289
            "beat2o": "beat2",
            // Day 291
            "chunky": "chunky",
            // Day 292
            "rebootsequencelog161": "rebootsequence",
            // Day 294
            "wysiwyg": "wysiwyg",
            // Day 296
            "openallnight": "openallnight",
            // Day 297
            "trip": "trip",
            // Day 298
            "burningitdowncomd2": "burningitdown",
            // Day 300
            "syntaxerrorinlifelog167": "syntaxerrorinlife",
            // Day 301
            "uploadingconsciousnesslog155": "uploadingconsciousness",
            // Day 303
            "adminaccessrequiredlog151": "adminaccessrequired",
            // Day 304
            "lockedup": "lockedup",
            // Day 305
            "negonnasstoplovingyou": "negonnastoplovingyou",
            // Day 306
            "installingupdateslog154": "installingupdates",
            // Day 307
            "hardtoignore": "hardtoignore",
            // Day 310
            "itsgonnabealright": "itsgonnabealright",
            // Day 311
            "pingtimeoutlog153": "pingtimeout",
            // Day 313
            "wrapthat": "wrapthat",
            // Day 314
            "decryptingfileslog152": "decryptingfiles",
            // Day 316
            "entropy": "entropy",
            // Day 317
            "odds": "odds",
            // Day 318
            "gogetit": "gogetit",
            // Day 319
            "comealongwithme": "comealongwithme",
            // Day 320
            "shesaidlilrichardwheredafuxu": "shesaidlilrichard",
            // Day 321
            "dontblameu": "dontblameyou",
            // Day 323
            "adminaccessrequiredlog165": "adminaccessrequired",
            // Day 324
            "advice2": "advice",
            // Day 325
            "climax": "climax",
            // Day 326
            "rebootsequencelog169": "rebootsequence",
            // Day 328
            "daemonrunninglog159": "daemonrunning",
            // Day 329
            "80sstack": "80sstack",
            // Day 330
            "pingtimeoutlog168": "pingtimeout",
            // Day 331
            "sodone": "sodone",
            // Day 332
            "endoflinelog160": "endofline",
            // Day 333
            "mypast": "mypast",
            // Day 334
            "yougotme": "yougotme",
            // Day 335
            "bb": "bb",
            // Day 336
            "404soulnotfoundlog157": "404soulnotfound",
            // Day 337
            "climbtoyou": "climbtoyou",
            // Day 338
            "basic": "basic",
            // Day 340
            "tracingroutetogodlog170": "tracingroutetogod",
            // Day 341
            "whenisayforever": "whenisayforever",
            // Day 344
            "beauty": "beauty",
            // Day 345
            "climbing2u": "climbingtoyou",
            // Day 346
            "spippin": "spippin",
            // Day 348
            "alf": "alf",
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
            // 1. Prepare Manifest Key
            const cleanStorageTitle = stripLeadingNumber(it.storageTitle);
            const keyTitle = normalize(cleanStorageTitle);
            
            // 2. Check Overrides first
            let searchKey = keyTitle;
            if (manualOverrides[keyTitle]) {
                searchKey = manualOverrides[keyTitle];
            }

            // 3. Try Matching (Title first, then Filename)
            let match = byTitle.get(searchKey) || byFile.get(searchKey);

            // 4. Fuzzy Fallback (if still no match)
            if (!match) {
               match = remoteReleases.find(r => {
                  const rTitle = normalize(r.storageTitle || r.title);
                  return rTitle.includes(searchKey) || searchKey.includes(rTitle);
               });
               if (match) console.log(`[Store] Fuzzy matched Day ${it.index}: '${it.storageTitle}'`);
            }

            const absDay = (offsets[it.month] ?? 0) + it.index;
            
            // 5. Force Correct Date (Jan 1 + Day Number)
            const startDate = new Date('2026-01-01');
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + absDay - 1);
            const correctDateStr = d.toISOString().split('T')[0];

            if (match) {
              return {
                ...match,
                day: absDay,
                date: correctDateStr, // Overwrite DB date
                title: it.storageTitle, // Keep manifest title for display
                storageTitle: it.storageTitle,
                manifestAudioPath: it.audioPath,
              } as Release;
            }
            
            // Fallback (No Match Found)
            console.warn(`[Store] Day ${absDay} (${it.storageTitle}): NO MATCH. Keys tried: '${searchKey}'`);
            return {
              id: `${it.month}-${it.index}`,
              day: absDay,
              date: correctDateStr,
              fileName: `${String(it.index).padStart(2,'0')} - ${it.storageTitle}.${it.ext}`,
              title: it.storageTitle,
              storageTitle: it.storageTitle,
              manifestAudioPath: it.audioPath,
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
            stats: {
                ...supabaseData.stats,
                totalReleases: remapped.length
            }
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
      console.log('[Store] Remote returned no data, checking local...');
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