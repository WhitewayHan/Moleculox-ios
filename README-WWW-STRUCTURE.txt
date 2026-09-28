Moleculox R380/v8.7.212 IOS - WWW preview compatibility.
This archive adds the R376-style directly visible www entry files.
The unmodified complete 343-file game asset bundle is in payload/ and is restored by
Codemagic script scripts/restore-www.sh before native build.
The www preview files are copies of that payload (plus harmless app.css/game.js/sw.js aliases).
Neither the game logic nor authentication behavior changes in this repack.
No independently named WhitewayHub component was found in the R376 input archives.
Cloud sync still needs correct server-side Firestore permissions.
