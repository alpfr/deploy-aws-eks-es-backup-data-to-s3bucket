import { parseCSV } from "./csv-parser.js";
const csv = `Main Event,        ,        ,        ,        ,        ,        , Q&A Session,        ,        ,        ,        ,        ,        
Date      ,01/05/25,01/12/25,01/19/25,01/26/25,        ,        , Date      ,01/05/25,01/12/25,01/19/25,01/26/25,        ,        
Youtube   , 150    , 160    , 180    , 175    ,        ,        , Youtube   , 80     , 90     , 85     , 100    ,        ,        
Twitch    , 300    , 320    , 340    , 350    ,        ,        , Twitch    , 10     , 15     , 20     , 12     ,        ,        
          ,        ,        ,        ,        ,        ,        , PT Online , 50     , 65     , 80     , 95     ,        ,        
Total     , 500    , 545    , 600    , 620    ,        ,        , Total     , 130    , 150    , 155    , 167    ,        ,        `;
console.log(JSON.stringify(parseCSV(csv).services['q_a_session'], null, 2));
