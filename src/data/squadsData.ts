import { SQUADS_PART2 } from './squadsDataPart2';
import { SQUADS_PART3 } from './squadsDataPart3';
import { SQUADS_PART4 } from './squadsDataPart4';

// Compressed official squad datasets for the 48 participating countries.
// Structure: "RealName|Position|Club|Height|BirthYear" separated by ";"
export const COMPRESSED_SQUADS: { [country: string]: string } = {
  "Argentina": "J. Musso|GK|Atlético Madrid (ESP)|193|1994;L. Balerdi|DF|Marseille (FRA)|188|1999;N. Tagliafico|DF|Lyon (FRA)|172|1992;G. Montiel|DF|CA River Plate (ARG)|175|1997;L. Paredes|MF|Boca Juniors (ARG)|182|1994;L. Martínez|DF|Manchester United (ENG)|175|1998;R. De Paul|MF|Inter Miami CF (USA)|178|1994;V. Barco|MF|RC Strasbourg (FRA)|172|2004;J. Álvarez|FW|Atlético Madrid (ESP)|170|2000;L. Messi|FW|Inter Miami CF (USA)|170|1987;G. Lo Celso|MF|Real Betis (ESP)|177|1996;G. Rulli|GK|Marseille (FRA)|189|1992;C. Romero|DF|Tottenham Hotspur (ENG)|185|1998;E. Palacios|MF|Bayer Leverkusen (GER)|177|1998;N. González|MF|Atlético Madrid (ESP)|180|1998;T. Almada|FW|Atlético Madrid (ESP)|171|2001;G. Simeone|FW|Atlético Madrid (ESP)|174|2002;N. Paz|FW|Como (ITA)|185|2004;N. Otamendi|DF|SL Benfica (POR)|182|1988;A. Mac Allister|MF|Liverpool FC (ENG)|176|1998;J. López|FW|Palmeiras (BRA)|190|2000;L. Martínez|FW|Inter Milán (ITA)|175|1997;E. Martínez|GK|Aston Villa (ENG)|195|1992;E. Fernández|MF|Chelsea FC (ENG)|178|2001;F. Medina|DF|Marseille (FRA)|184|1999;N. Molina|DF|Atlético Madrid (ESP)|179|1998",
  
  "Brasil": "Alisson B.|GK|Liverpool FC (ENG)|193|1992;Éderson S.|MF|Atalanta (ITA)|184|1999;Gabriel M.|DF|Arsenal FC (ENG)|190|1997;Marquinhos|DF|PSG (FRA)|183|1994;Casemiro|MF|Manchester United (ENG)|185|1992;Alex Sandro|DF|Flamengo (BRA)|180|1991;Vinicius Jr|FW|Real Madrid (ESP)|176|2000;Bruno G.|MF|Newcastle (ENG)|182|1997;M. Cunha|FW|Manchester United (ENG)|183|1999;Neymar Jr|FW|Santos FC (BRA)|175|1992;Raphinha|FW|FC Barcelona (ESP)|176|1996;Weverton|GK|Grêmio (BRA)|189|1987;Danilo|DF|Flamengo (BRA)|184|1991;Bremer|DF|Juventus (ITA)|188|1997;Léo Pereira|DF|Flamengo (BRA)|189|1996;Douglas S.|DF|Zenit (RUS)|173|1994;Fabinho|MF|Al Ittihad (KSA)|188|1993;Danilo S.|MF|Botafogo (BRA)|177|2001;Endrick|FW|Marseille (FRA)|172|2006;L. Paquetá|MF|Flamengo (BRA)|183|1997;L. Henrique|FW|Zenit (RUS)|182|2001;Martinelli|FW|Arsenal FC (ENG)|178|2001;Ederson M.|GK|Fenerbahçe (TUR)|188|1993;Roger Ibañez|DF|Al Ahli (KSA)|186|1998;Igor Thiago|FW|Brentford (ENG)|190|2001;Rayan V.|FW|Bournemouth (ENG)|187|2006",
  
  "Francia": "B. Samba|GK|Lens (FRA)|187|1994;M. Gusto|DF|Chelsea (ENG)|179|2003;L. Digne|DF|Aston Villa (ENG)|178|1993;D. Upamecano|DF|Bayern Múnich (GER)|186|1998;J. Koundé|DF|FC Barcelona (ESP)|178|1998;M. Koné|MF|AS Roma (ITA)|185|2001;O. Dembélé|FW|PSG (FRA)|179|1997;A. Tchouaméni|MF|Real Madrid (ESP)|188|2000;M. Thuram|FW|Inter Milán (ITA)|192|1997;K. Mbappé|FW|Real Madrid (ESP)|180|1998;M. Olise|FW|Bayern Múnich (GER)|184|2001;B. Barcola|FW|PSG (FRA)|187|2002;N. Kanté|MF|Fenerbahçe (TUR)|171|1991;A. Rabiot|MF|AC Milan (ITA)|191|1995;I. Konaté|DF|Liverpool (ENG)|194|1999;M. Maignan|GK|AC Milan (ITA)|191|1995;W. Saliba|DF|Arsenal (ENG)|192|2001;W. Zaïre-Emery|MF|PSG (FRA)|176|2006;T. Hernández|DF|Al Hilal (KSA)|184|1997;Désiré Doué|FW|PSG (FRA)|182|2005;L. Hernández|DF|PSG (FRA)|184|1996;J. Mateta|FW|Crystal Palace (ENG)|192|1997;R. Risser|GK|Lens (FRA)|193|2004;R. Cherki|MF|Manchester City (ENG)|180|2003;M. Akliouche|MF|AS Monaco (FRA)|183|2002;M. Lacroix|DF|Crystal Palace (ENG)|192|2000",
  
  "España": "D. Raya|GK|Arsenal (ENG)|186|1995;Marc Pubill|DF|Atlético Madrid (ESP)|191|2003;A. Grimaldo|DF|Bayer Leverkusen (GER)|171|1995;Eric García|DF|FC Barcelona (ESP)|183|2001;M. Llorente|DF|Atlético Madrid (ESP)|183|1995;Mikel Merino|MF|Arsenal (ENG)|188|1996;Ferran Torres|FW|FC Barcelona (ESP)|183|2000;Fabián Ruiz|MF|PSG (FRA)|188|1996;Gavi|MF|FC Barcelona (ESP)|173|2004;Dani Olmo|FW|FC Barcelona (ESP)|179|1998;Yeremy Pino|FW|Crystal Palace (ENG)|174|2002;Pedro Porro|DF|Tottenham (ENG)|173|1999;Joan Garcia|GK|FC Barcelona (ESP)|194|2001;A. Laporte|DF|Athletic Club (ESP)|191|1994;Alex Baena|MF|Atlético Madrid (ESP)|172|2001;Rodri H.|MF|Manchester City (ENG)|190|1996;Nico Williams|FW|Athletic Club (ESP)|181|2002;M. Zubimendi|MF|Arsenal (ENG)|181|1999;Lamine Yamal|FW|FC Barcelona (ESP)|183|2007;Pedri|MF|FC Barcelona (ESP)|174|2002;M. Oyarzabal|FW|Real Sociedad (ESP)|181|1997;Pau Cubarsí|DF|FC Barcelona (ESP)|183|2007;Unai Simón|GK|Athletic Club (ESP)|190|1997;M. Cucurella|DF|Chelsea (ENG)|173|1998;Víctor M.V.|FW|CA Osasuna (ESP)|173|2003;Borja Iglesias|FW|RC Celta (ESP)|187|1993",

  "México": "R. Rangel|GK|Chivas (MEX)|190|2000;J. Sánchez|DF|PAOK (GRE)|176|1997;C. Montes|DF|Lokomotiv (RUS)|191|1997;E. Álvarez|DF|Fenerbahçe (TUR)|180|1997;J. Vásquez|DF|Genoa (ITA)|182|1998;Erik Lira|MF|Cruz Azul (MEX)|172|2000;Luis Romo|MF|Chivas (MEX)|183|1995;A. Fidalgo|MF|Real Betis (ESP)|175|1997;Raúl Jiménez|FW|Fulham (ENG)|188|1991;Alexis Vega|FW|Toluca (MEX)|175|1997;S. Giménez|FW|AC Milan (ITA)|180|2001;C. Acevedo|GK|Santos (MEX)|185|1996;G. Ochoa|GK|AEL Limassol (CYP)|185|1985;A. González|FW|Chivas (MEX)|182|2003;Israel Reyes|DF|América (MEX)|181|2000;J. Quiñones|FW|Al Qadsiah (KSA)|177|1997;O. Pineda|MF|AEK Athens (GRE)|169|1996;Obed Vargas|MF|Atlético Madrid (ESP)|175|2005;G. Mora|MF|Tijuana (MEX)|175|2008;M. Chávez|DF|AZ Alkmaar (NED)|178|2004;C. Huerta|FW|Anderlecht (BEL)|171|2000;G. Martínez|FW|Pumas (MEX)|191|1995;J. Gallardo|DF|Toluca (MEX)|174|1994;Luis Chávez|MF|Dynamo Moscú (RUS)|178|1996;R. Alvarado|FW|Chivas (MEX)|176|1998;B. Gutiérrez|MF|Chivas (MEX)|178|2003",

  "Alemania": "M. Neuer|GK|Bayern Múnich (GER)|193|1986;A. Rüdiger|DF|Real Madrid (ESP)|190|1993;W. Anton|DF|Dortmund (GER)|189|1996;J. Tah|DF|Bayern Múnich (GER)|195|1996;A. Pavlović|MF|Bayern Múnich (GER)|188|2004;J. Kimmich|DF|Bayern Múnich (GER)|177|1995;K. Havertz|FW|Arsenal (ENG)|190|1999;L. Goretzka|MF|Bayern Múnich (GER)|189|1995;J. Leweling|MF|VfB Stuttgart (GER)|185|2001;J. Musiala|MF|Bayern Múnich (GER)|180|2003;N. Woltemade|FW|Newcastle (ENG)|198|2002;O. Baumann|GK|Hoffenheim (GER)|187|1990;P. Groß|MF|Brighton (ENG)|181|1991;M. Beier|FW|Dortmund (GER)|185|2002;N. Schlotterbeck|DF|Dortmund (GER)|191|1999;A. Stiller|MF|VfB Stuttgart (GER)|183|2001;F. Wirtz|MF|Liverpool (ENG)|176|2003;N. Brown|DF|Frankfurt (GER)|176|2003;L. Sané|MF|Galatasaray (TUR)|183|1996;N. Amiri|MF|Mainz 05 (GER)|178|1996;A. Nübel|GK|VfB Stuttgart (GER)|193|1996;D. Raum|DF|RB Leipzig (GER)|180|1998;F. Nmecha|MF|Dortmund (GER)|190|2000;M. Thiaw|DF|Newcastle (ENG)|194|2001;A. Ouedraogo|MF|RB Leipzig (GER)|191|2006;D. Undav|FW|VfB Stuttgart (GER)|179|1996",

  "Inglaterra": "J. Pickford|GK|Everton (ENG)|185|1994;E. Konsa|DF|Aston Villa (ENG)|180|1997;N. O'Reilly|DF|Manchester City (ENG)|177|2005;Declan Rice|MF|Arsenal (ENG)|185|1999;John Stones|DF|Manchester City (ENG)|188|1994;Marc Guéhi|DF|Manchester City (ENG)|183|2000;Bukayo Saka|FW|Arsenal (ENG)|178|2001;E. Anderson|MF|Nottingham (ENG)|179|2002;Harry Kane|FW|Bayern Múnich (GER)|190|1993;J. Bellingham|MF|Real Madrid (ESP)|183|2003;M. Rashford|FW|FC Barcelona (ESP)|180|1997;T. Livramento|DF|Newcastle (ENG)|182|2002;D. Henderson|GK|Crystal Palace (ENG)|188|1997;J. Henderson|MF|Brentford (ENG)|183|1990;Dan Burn|DF|Newcastle (ENG)|201|1992;K. Mainoo|MF|Manchester United (ENG)|183|2005;M. Rogers|MF|Aston Villa (ENG)|187|2002;A. Gordon|FW|Newcastle (ENG)|182|2001;Ollie Watkins|FW|Aston Villa (ENG)|180|1995;Noni Madueke|FW|Arsenal (ENG)|182|2002;E. Eze|MF|Arsenal (ENG)|178|1998;Ivan Toney|FW|Al Ahli (KSA)|185|1996;J. Trafford|GK|Manchester City (ENG)|197|2002;Reece James|DF|Chelsea (ENG)|180|1999;Djed Spence|DF|Tottenham (ENG)|184|2000;J. Quansah|DF|Bayer Leverkusen (GER)|190|2003",

  "Uruguay": "S. Rochet|GK|Inter (BRA)|189|1993;J.M. Giménez|DF|Atlético Madrid (ESP)|186|1995;S. Cáceres|DF|América (MEX)|180|1999;R. Araujo|DF|FC Barcelona (ESP)|185|1999;M. Ugarte|MF|Manchester United (ENG)|182|2001;R. Bentancur|MF|Tottenham (ENG)|187|1997;N. De La Cruz|MF|Flamengo (BRA)|167|1997;F. Valverde|MF|Real Madrid (ESP)|182|1998;Darwin Núñez|FW|Al Hilal (KSA)|185|1999;G. De Arrascaeta|MF|Flamengo (BRA)|177|1994;F. Pellistri|FW|Panathinaikos (GRE)|174|2001;S. Mele|GK|Monterrey (MEX)|185|1997;G. Varela|DF|Flamengo (BRA)|174|1993;A. Canobbio|MF|Fluminense (BRA)|176|1998;E. Martínez|MF|Palmeiras (BRA)|184|1999;M. Olivera|DF|Napoli (ITA)|174|1997;M. Viña|DF|River Plate (ARG)|180|1997;B. Rodríguez|FW|América (MEX)|175|2000;R. Aguirre|FW|Tigres UANL (MEX)|182|1994;Maxi Araújo|MF|Sporting CP (POR)|176|2000;F. Viñas|FW|Real Oviedo (ESP)|181|1998;J. Piquerez|MF|Palmeiras (BRA)|185|1998;F. Muslera|GK|Estudiantes LP (ARG)|190|1986;S. Bueno|DF|Wolverhampton (ENG)|191|1998;J.Sanabria|MF|Real Salt Lake (USA)|170|2000;R. Zalazar|MF|SC Braga (POR)|175|1999",

  "Colombia": "D. Ospina|GK|Atlético Nacional (COL)|183|1988;D. Muñoz|DF|Crystal Palace (ENG)|180|1996;J. Lucumí|DF|Bologna (ITA)|187|1998;S. Arias|DF|Independiente (ARG)|177|1992;K. Castaño|MF|River Plate (ARG)|179|2000;R. Ríos|MF|Benfica (POR)|185|2000;Luis Díaz|FW|Bayern Múnich (GER)|179|1997;J. Carrascal|MF|Flamengo (BRA)|180|1998;Jhon Córdoba|FW|Krasnodar (RUS)|186|1993;James R.|MF|Minnesota United (USA)|181|1991;Jhon Arias|MF|Palmeiras (BRA)|168|1997;C. Vargas|GK|Atlas (MEX)|183|1989;Yerry Mina|DF|Cagliari (ITA)|195|1994;G. Puerta|DF|Racing Santander (ESP)|173|2003;J. Portilla|MF|A. Paranaense (BRA)|181|1998;J. Lerma|MF|Crystal Palace (ENG)|180|1994;J. Mojica|DF|RCD Mallorca (ESP)|184|1992;W. Ditta|DF|Cruz Azul (MEX)|179|1998;C. Hernández|FW|Real Betis (ESP)|176|1999;J. Quintero|MF|River Plate (ARG)|167|1993;J. Campaz|FW|Rosario Central (ARG)|166|2000;D. Machado|DF|Nantes (FRA)|173|1993;D. Sánchez|DF|Galatasaray (TUR)|188|1996;Alvaro Montero|GK|Vélez Sarsfield (ARG)|201|1995;Luis Suárez|FW|Sporting CP (POR)|179|1997;A. Gómez|FW|Vasco da Gama (BRA)|170|2002",
  
  "Japón": "Zion Suzuki|GK|Parma (ITA)|190|2002;Y. Sugawara|DF|Werder Bremen (GER)|179|2000;S. Taniguchi|DF|Sint-Truiden (BEL)|185|1991;Kou Itakura|DF|AFC Ajax (NED)|188|1997;Y. Nagatomo|DF|FC Tokyo (JPN)|170|1986;Wataru Endo|MF|Liverpool FC (ENG)|178|1993;Ao Tanaka|MF|Leeds United (ENG)|180|1998;T. Kubo|MF|Real Sociedad (ESP)|173|2001;K. Goto|FW|Sint-Truiden (BEL)|191|2005;Ritsu Doan|MF|Eintracht Frankfurt (GER)|172|1998;D. Maeda|MF|Celtic FC (SCO)|173|1997;K. Osako|GK|Sanfrecce Hiroshima (JPN)|188|1999;K. Nakamura|MF|Stade Reims (FRA)|180|2000;Junya Ito|MF|KRC Genk (BEL)|177|1993;Daichi Kamada|MF|Crystal Palace (ENG)|180|1996;T. Watanabe|DF|Feyenoord (NED)|184|1997;Yuito Suzuki|MF|SC Freiburg (GER)|175|2001;Ayase Ueda|FW|Feyenoord (NED)|182|1998;Koki Ogawa|FW|NEC Nijmegen (NED)|186|1997;Ayumu Seko|DF|Le Havre (FRA)|186|2000;Hiroki Ito|DF|Bayern Múnich (GER)|188|1999;T. Tomiyasu|DF|AFC Ajax (NED)|187|1998;T. Hayakawa|GK|Kashima Antlers (JPN)|187|1999;Kaishu Sano|MF|Mainz 05 (GER)|176|2000;J. Suzuki|DF|FC København (DEN)|180|2003;Kento Shiogai|FW|VfL Wolfsburg (GER)|180|2005",

  "Portugal": "Diogo Costa|GK|FC Porto (POR)|188|1999;N. Semedo|DF|Fenerbahçe (TUR)|179|1993;Rúben Dias|DF|Manchester City (ENG)|187|1997;Tomás Araujo|DF|SL Benfica (POR)|187|2002;Diogo Dalot|DF|Manchester United (ENG)|184|1999;M. Nunes|MF|Manchester City (ENG)|183|1998;C. Ronaldo|FW|Al Nassr (KSA)|185|1985;B. Fernandes|MF|Manchester United (ENG)|183|1994;Gonçalo Ramos|FW|PSG (FRA)|185|2001;Bernardo Silva|MF|Manchester City (ENG)|173|1994;João Félix|FW|Al Nassr (KSA)|179|1999;José Sá|GK|Wolverhampton (ENG)|192|1993;Renato Veiga|DF|Villarreal (ESP)|188|2003;G. Inácio|DF|Sporting CP (POR)|185|2001;João Neves|MF|PSG (FRA)|171|2004;F. Trincão|FW|Sporting CP (POR)|184|1999;Rafael Leão|FW|AC Milan (ITA)|188|1999;Pedro Neto|FW|Chelsea (ENG)|174|2000;G. Guedes|FW|Real Sociedad (ESP)|179|1996;João Cancelo|DF|FC Barcelona (ESP)|173|1994;Rúben Neves|MF|Al Hilal (KSA)|183|1997;Rui Silva|GK|Sporting CP (POR)|191|1994;Vitinha|MF|PSG (FRA)|170|2000;Samú Costa|DF|RCD Mallorca (ESP)|185|2000;Nuno Mendes|DF|PSG (FRA)|177|2002;F. Conceição|FW|Juventus (ITA)|166|2002",

  "Marruecos": "Y. Bounou|GK|Al Hilal (KSA)|192|1991;Achraf Hakimi|DF|PSG (FRA)|180|1998;N. Mazraoui|DF|Manchester United (ENG)|183|1997;Sofyan Amrabat|MF|Real Betis (ESP)|185|1996;Nayef Aguerd|DF|Marseille (FRA)|190|1996;A. Bouaddi|MF|Lille OSC (FRA)|185|2007;Chemsdine Talbi|MF|Sunderland (ENG)|175|2005;A. Ounahi|MF|Girona FC (ESP)|182|2000;Souane Rahimi|FW|Al Ain (UAE)|180|1996;Brahim Díaz|FW|Real Madrid (ESP)|170|1999;Ismael Saibari|MF|PSV Eindhoven (NED)|185|2001;M. El Kajoui|GK|RS Berkane (MAR)|190|1989;Z. El Ouahdi|DF|KRC Genk (BEL)|171|2001;Issa Diop|DF|Fulham (ENG)|194|1997;Samir El Mourabet|MF|RC Strasbourg (FRA)|187|2005;Gessime Yassine|MF|RC Strasbourg (FRA)|172|2005;A. Ezzalzouli|FW|Real Betis (ESP)|177|2001;Chadi Riad|DF|Crystal Palace (ENG)|186|2003;Y. Belammari|DF|Al Ahly (EGY)|175|1998;Ayoub El Kaabi|FW|Olympiacos (GRE)|182|1993;Ayoube Amaimouni|FW|Frankfurt (GER)|179|2004;A. Tagnaouti|GK|ASFAR (MAR)|194|1996;Bilal El Khannouss|MF|VfB Stuttgart (GER)|180|2004;Neil El Aynaoui|MF|AS Roma (ITA)|185|2001;R. Halhal|DF|KV Mechelen (BEL)|189|2003;Anass Salah-Eddine|DF|PSV Eindhoven (NED)|181|2002",
  
  "Argelia": "M. Mastil|GK|FC Stade Nyonnais (SUI)|194|2000;Aissa Mandi|DF|Lille OSC (FRA)|184|1991;Achref Abada|DF|USM Alger (ALG)|185|1999;M. Tougai|DF|Espérance (TUN)|186|2000;Z. Belaid|DF|JS Kabylie (ALG)|186|1999;Ramiz Zerrouki|MF|FC Twente (NED)|183|1998;Riyad Mahrez|FW|Al Ahli (KSA)|179|1991;Houssem Aouar|MF|Al Ittihad (KSA)|175|1998;Amine Gouiri|FW|Marseille (FRA)|180|2000;Fares Chaibi|MF|Eintracht Frankfurt (GER)|183|2002;A. Hadj Moussa|FW|Feyenoord (NED)|176|2002;N. Benbouali|FW|Györi ETO (HUN)|190|2000;Jaouen Hadjam|DF|BSC Young Boys (SUI)|185|2003;H. Boudaoui|MF|OGC Nice (FRA)|175|1999;R. Aït-Nouri|DF|Manchester City (ENG)|180|2001;Oussama Benbot|GK|USM Alger (ALG)|188|1994;Rafik Belghali|DF|Hellas Verona (ITA)|180|2002;M. Amoura|FW|VfL Wolfsburg (GER)|170|2000;Nabil Bentaleb|MF|Lille OSC (FRA)|189|1994;Adil Boulbina|FW|Al Duhail (QAT)|183|2003;Ramy Bensebaini|DF|Dortmund (GER)|187|1995;Ibrahim Maza|MF|Bayer Leverkusen (GER)|180|2005;Luca Zidane|GK|Granada CF (ESP)|183|1998;Yassine Titraoui|MF|Sporting Charleroi (BEL)|180|2003;Fares Ghedjemis|FW|Frosinone (ITA)|183|2002;Samir Chergui|DF|Paris FC (FRA)|185|1999",

  "Australia": "Mathew Ryan|GK|Levante UD (ESP)|184|1992;Milos Degenek|DF|APOEL FC (CYP)|187|1994;A. Circati|DF|Parma (ITA)|191|2003;Jacob Italiano|DF|Grazer AK (AUT)|177|2001;Jordan Bos|DF|Feyenoord (NED)|180|2002;Jason Geria|DF|Albirex Niigata (JPN)|181|1993;Mathew Leckie|FW|Melbourne City (AUS)|181|1991;Connor Metcalfe|MF|FC St. Pauli (GER)|183|1999;Mohamed Toure|FW|Norwich City (ENG)|186|2004;Ajdin Hrustic|FW|SC Heracles (NED)|180|1996;Awer Mabil|FW|CD Castellón (ESP)|178|1995;Paul Izzo|GK|Randers FC (DEN)|184|1995;Aiden O'Neill|MF|New York City (USA)|180|1998;Cameron Devlin|MF|Heart of Midlothian (SCO)|170|1998;Kai Trewin|DF|New York City (USA)|183|2001;Aziz Behich|DF|Melbourne City (AUS)|170|1990;N. Irankunda|FW|Watford FC (ENG)|165|2006;Patrick Beach|GK|Melbourne City (AUS)|189|2003;Harry Souttar|DF|Leicester City (ENG)|198|1998;C. Volpato|FW|US Sassuolo (ITA)|187|2003;C. Burgess|DF|Swansea City (WAL)|194|1995;Jackson Irvine|MF|FC St. Pauli (GER)|189|1993;N. Velupillay|FW|Melbourne Victory (AUS)|181|2001;Paul Okon-Engstler|MF|Sydney FC (AUS)|185|2005;L. Herrington|DF|Colorado Rapids (USA)|193|2007;Tete Yengi|FW|FC Machida Zelvia (JPN)|197|2000",

  "Austria": "A. Schlager|GK|FC Red Bull Salzburg (AUT)|188|1996;D. Affengruber|DF|Elche CF (ESP)|185|2001;Kevin Danso|DF|Tottenham (ENG)|190|1998;Xaver Schlager|MF|RB Leipzig (GER)|174|1997;Stefan Posch|DF|1. FSV Mainz 05 (GER)|188|1997;Nicolas Seiwald|MF|RB Leipzig (GER)|179|2001;M. Arnautovic|FW|FK Crvena Zvezda (SRB)|192|1989;David Alaba|DF|Real Madrid (ESP)|180|1992;Marcel Sabitzer|MF|Dortmund (GER)|178|1994;Florian Grillitsch|MF|SC Braga (POR)|186|1995;M. Gregoritsch|FW|FC Augsburg (GER)|193|1994;Florian Wiegele|GK|FC Viktoria Plzeň (CZE)|205|2001;Patrick Pentz|GK|Brøndby IF (DEN)|183|1997;Sasa Kalajdzic|FW|LASK Linz (AUT)|200|1997;Philipp Lienhart|DF|SC Freiburg (GER)|189|1996;Phillip Mwene|DF|1. FSV Mainz 05 (GER)|170|1994;C. Chukwuemeka|MF|Dortmund (GER)|187|2003;Romano Schmid|MF|SV Werder Bremen (GER)|168|2000;C. Baumgartner|MF|RB Leipzig (GER)|180|1999;Konrad Laimer|MF|FC Bayern München (GER)|180|1997;Patrick Wimmer|FW|VfL Wolfsburg (GER)|182|2001;Alexander Prass|MF|TSG Hoffenheim (GER)|180|2001;Marco Friedl|DF|SV Werder Bremen (GER)|187|1998;Paul Wanner|MF|PSV Eindhoven (NED)|185|2005;Michael Svoboda|DF|Venezia FC (ITA)|195|1998;A. Schoepf|MF|Wolfsberger AC (AUT)|178|1994",

  "Bélgica": "T. Courtois|GK|Real Madrid (ESP)|199|1992;Zeno Debast|DF|Sporting CP (POR)|189|2003;Arthur Theate|DF|Eintracht Frankfurt (GER)|185|2000;Brandon Mechele|DF|Club Brugge (BEL)|190|1993;Maxim De Cuyper|DF|Brighton (ENG)|182|2000;Axel Witsel|MF|Girona FC (ESP)|186|1989;Kevin De Bruyne|MF|SSC Napoli (ITA)|181|1991;Youri Tielemans|MF|Aston Villa (ENG)|176|1997;Romelu Lukaku|FW|SSC Napoli (ITA)|190|1993;Leandro Trossard|FW|Arsenal (ENG)|172|1994;Jérémy Doku|FW|Manchester City (ENG)|173|2002;Senne Lammens|GK|Manchester United (ENG)|193|2002;Mike Penders|GK|RC Strasbourg (FRA)|200|2005;Dodi Lukebakio|FW|SL Benfica (POR)|184|1997;Thomas Meunier|DF|Lille OSC (FRA)|190|1991;Koni De Winter|DF|AC Milan (ITA)|191|2002;C. De Ketelaere|FW|Atalanta (ITA)|192|2001;Joaquin Seys|DF|Club Brugge (BEL)|178|2005;Diego Moreira|MF|RC Strasbourg (FRA)|179|2004;Hans Vanaken|MF|Club Brugge (BEL)|195|1992;Timothy Castagne|DF|Fulham (ENG)|185|1995;A. Saelemaekers|MF|AC Milan (ITA)|180|1999;Nicolas Raskin|MF|Rangers FC (SCO)|178|2001;Amadou Onana|MF|Aston Villa (ENG)|192|2001;Nathan Ngoy|DF|Lille OSC (FRA)|183|2003;M. Fernandez-Pardo|FW|Lille OSC (FRA)|188|2005",

  "Bosnia y Herzegovina": "Nikola Vasilj|GK|FC St. Pauli (GER)|193|1995;Nihad Mujakic|DF|Gaziantep FK (TUR)|189|1998;D. Hadzikadunic|DF|UC Sampdoria (ITA)|191|1998;T. Muharemovic|DF|US Sassuolo (ITA)|192|2003;Sead Kolasinac|DF|Atalanta (ITA)|183|1993;B. Tahirovic|MF|Brøndby IF (DEN)|191|2003;Amar Dedic|DF|SL Benfica (POR)|180|2002;Armin Gigovic|MF|BSC Young Boys (SUI)|187|2002;Samed Bazdar|FW|Jagiellonia (POL)|189|2004;Ermedin Demirovic|FW|VfB Stuttgart (GER)|185|1998;Edin Dzeko|FW|FC Schalke 04 (GER)|192|1986;Mladen Jurkas|GK|FK Borac Banja Luka (BIH)|193|2007;Ivan Basic|MF|FC Astana (KAZ)|178|2002;Ivan Sunjic|MF|Pafos FC (CYP)|183|1996;Amar Memic|MF|FC Viktoria Plzeň (CZE)|176|2001;A. Hadziahmetovic|MF|Hull City (ENG)|179|1997;Dzenis Burnic|MF|Karlsruher SC (GER)|182|1998;Nikola Katic|DF|FC Schalke 04 (GER)|194|1996;K. Alajbegovic|FW|FC Red Bull Salzburg (AUT)|186|2007;E. Bajraktarevic|FW|PSV Eindhoven (NED)|175|2005;Stjepan Radeljic|DF|HNK Rijeka (CRO)|201|1997;Martin Zlomislic|GK|HNK Rijeka (CRO)|189|1998;Haris Tabakovic|FW|Dortmund (GER)|196|1994;Nidal Celik|DF|RC Lens (FRA)|192|2006;Jovo Lukic|FW|Universitatea Cluj (ROU)|190|1998;Ermin Mahmic|MF|FC Slovan Liberec (CZE)|182|2005",

  "Cabo Verde": "Vozinha|GK|GD Chaves (POR)|189|1986;Stopira|DF|SCU Torreense (POR)|178|1888;Diney Borges|DF|Al Bataeh (UAE)|185|1995;Pico Lopes|DF|Shamrock Rovers (IRL)|186|1992;Logan Costa|DF|Villarreal (ESP)|190|2001;Kevin Pina|MF|FC Krasnodar (RUS)|177|1997;Jovane Cabral|MF|CF Estrela (POR)|174|1998;João Paulo|MF|FC FCSB (ROU)|180|2005;G. Benchimol|FW|FC Akron Tolyatti (RUS)|187|2001;Jamiro Monteiro|MF|PEC Zwolle (NED)|175|1993;Garry Rodrigues|MF|Apollon Limassol (CYP)|173|1990;Marcio Rosa|GK|PFC Montana (BUL)|186|1997;S. Lopes Cabral|DF|SL Benfica (POR)|176|2002;Deroy Duarte|MF|PFC Ludogorets (BUL)|177|1999;Laros Duarte|MF|Puskás Akadémia (HUN)|180|1997;Yannick Semedo|MF|SC Farense (POR)|176|1995;Willy Semedo|MF|AC Omonia (CYP)|185|1994;Telmo Arcanjo|MF|Vitória SC (POR)|180|2001;D. Livramento|FW|Casa Pi AC (POR)|185|2001;Ryan Mendes|FW|Iğdır FK (TUR)|178|1990;Nuno Da Costa|MF|Başakşehir (TUR)|182|1991;Steven Moreira|DF|Columbus Crew (USA)|178|1994;CJ Dos Santos|GK|San Diego FC (USA)|189|2000;Wagner Pina|DF|Trabzonspor (TUR)|180|2002;Kelvin Pires|DF|SJK (FIN)|193|2000;Helio Varela|MF|Maccabi Tel-Aviv (ISR)|176|2002",
  
  "Canadá": "D. St. Clair|GK|Inter Miami (USA)|191|1997;A. Johnston|DF|Celtic FC (SCO)|180|1998;Ale Jones|DF|Middlesbrough (ENG)|191|1997;L. De Fougerolles|DF|FCV Dender EH (BEL)|183|2005;Joel Waterman|DF|Chicago Fire (USA)|185|1996;M. Choinière|MF|LAFC (USA)|173|1999;S. Eustáquio|MF|LAFC (USA)|175|1996;Ismael Koné|MF|US Sassuolo (ITA)|188|2002;Cyle Larin|FW|Southampton (ENG)|188|1995;Jonathan David|FW|Juventus (ITA)|175|2000;Liam Millar|MF|Hull City (ENG)|176|1999;Tani Oluwaseyi|FW|Villarreal (ESP)|187|2000;D. Cornelius|DF|Rangers FC (SCO)|186|1997;J. Shaffelburg|MF|LAFC (USA)|181|1999;Moise Bombito|DF|OGC Nice (FRA)|190|2000;M. Crépeau|GK|Orlando City (USA)|185|1994;Tajon Buchanan|FW|Villarreal (ESP)|183|1999;Owen Goodman|GK|Barnsley (ENG)|193|2003;A. Davies|DF|Bayern Múnich (GER)|183|2000;Ali Ahmed|FW|Norwich City (ENG)|180|2000;J. Osorio|MF|Toronto FC (CAN)|175|1992;Richie Laryea|DF|Toronto FC (CAN)|175|1995;Niko Sigur|DF|HNK Hajduk Split (CRO)|178|2003;Promise David|FW|Union Saint-Gilloise (BEL)|195|2001;Nathan Saliba|MF|RSC Anderlecht (BEL)|174|2004;Marcelo Flores|MF|Tigres UANL (MEX)|164|2003",

  "Costa de Marfil": "Y. Fofana|GK|Çaykur Rizespor (TUR)|194|2000;O. Diomande|DF|Sporting CP (POR)|190|2003;G. Konan|DF|Gil Vicente (POR)|176|1995;J. Seri|MF|NK Maribor (SVN)|168|1991;W. Singo|DF|Galatasaray (TUR)|182|2000;Seko Fofana|MF|FC Porto (POR)|185|1995;O. Kossounou|DF|Atalanta (ITA)|191|2001;Franck Kessié|MF|Al Ahli (KSA)|183|1996;A. Bonny|FW|Inter Milán (ITA)|189|2003;Simon Adingra|FW|AS Monaco (FRA)|175|2002;Yan Diomande|FW|RB Leipzig (GER)|180|2006;Elye Wahi|FW|OGC Nice (FRA)|181|2003;C. Operi|DF|Başakşehir (TUR)|183|1997;Oumar Diakite|FW|Cercle Brugge (BEL)|182|2003;Amad Diallo|FW|Manchester United (ENG)|173|2002;Mohamed Koné|GK|Sporting Charleroi (BEL)|186|2002;Guela Doué|DF|RC Strasbourg (FRA)|187|2002;I. Sangaré|MF|Nottingham (ENG)|191|1997;Nicolas Pépé|FW|Villarreal (ESP)|183|1995;E. Agbadou|DF|Beşiktaş JK (TUR)|185|1997;Evan Ndicka|DF|AS Roma (ITA)|192|1999;Evann Guessand|FW|Crystal Palace (ENG)|188|2001;Alban Lafont|GK|Panathinaikos (GRE)|196|1999;B. Touré|FW|Hoffenheim (GER)|178|2006;P. Guiagon|MF|Sporting Charleroi (BEL)|165|2001;Christ Inao|MF|Trabzonspor (TUR)|173|2006"
};

// Custom detailed map for Mexico squad with premium comic descriptions, nicknames, ratings, and subPositions
const MEXICO_PLAYERS_MAP: {
  [realName: string]: {
    nickname: string;
    subPosition: string;
    rating: number;
    styleOfPlay: string;
  }
} = {
  "R. Rangel": {
    nickname: "El Tala",
    subPosition: "Portero Promesa",
    rating: 84,
    styleOfPlay: "Joven arquero surgido de las fuerzas básicas de Chivas, consolidándose rápidamente como una realidad sólida. Gran envergadura física, sobriedad, excelentes reflejos en tiros a corta distancia y buen manejo del juego aéreo."
  },
  "G. Ochoa": {
    nickname: "Memo / Paco Memo",
    subPosition: "Portero Legendario",
    rating: 89,
    styleOfPlay: "Histórico portero de la Selección Mexicana con amplia trayectoria internacional y europea. Reflejos felinos bajo los tres postes, excelente en el uno contra uno, arquero de línea clásico."
  },
  "C. Acevedo": {
    nickname: "El Guardián / Tex-Tex",
    subPosition: "Portero Acrobático",
    rating: 85,
    styleOfPlay: "Carismático guardameta de Santos Laguna, reconocido por su liderazgo, entrega y agilidad. Acrobático, espectacular, con una gran elasticidad y reacciones rápidas en achiques."
  },
  "C. Montes": {
    nickname: "El Cachorro",
    subPosition: "Defensor Central",
    rating: 87,
    styleOfPlay: "Defensor central imponente con gran experiencia en el fútbol europeo y columna vertebral de la selección. Implacable juego aéreo defensivo y ofensivo, gran lectura de juego para la anticipación y salida limpia con balones largos."
  },
  "E. Álvarez": {
    nickname: "El Machín",
    subPosition: "Líder Indiscutible",
    rating: 91,
    styleOfPlay: "Líder indiscutible del carácter y el mediocampo defensivo, con temperamento fuerte y portador del brazalete. Despliegue físico, agresividad oportuna en la marca, coberturas perfectas y excelente capacidad para recuperar balones."
  },
  "Israel Reyes": {
    nickname: "Isra",
    subPosition: "Defensor Versátil",
    rating: 85,
    styleOfPlay: "Defensor versátil del Club América que puede desempeñarse como central, lateral o contención. Técnico, elegante, con buena conducción hacia el frente para romper líneas y adaptarse a asignaciones tácticas."
  },
  "J. Gallardo": {
    nickname: "Vegeta",
    subPosition: "Lateral de Recorrido",
    rating: 84,
    styleOfPlay: "Lateral o carrilero izquierdo de enorme recorrido y constante regularidad en el entorno local. Ida y vuelta constante (box-to-box lateral), aporta mucha profundidad por la banda gracias a su velocidad y potencia ofensiva."
  },
  "J. Vásquez": {
    nickname: "El Pipe",
    subPosition: "Central de Serie A",
    rating: 88,
    styleOfPlay: "Defensor central zurdo consolidado en la exigente escuela táctica de la Serie A italiana. Marca personal pegajosa, tiempista exacto para las barridas defensivas y un timing aéreo impecable en el área."
  },
  "J. Sánchez": {
    nickname: "El Jorch",
    subPosition: "Lateral Intenso",
    rating: 83,
    styleOfPlay: "Lateral derecho de gran despliegue físico con recorrido en el fútbol del viejo continente. Intenso, físico y veloz en el repliegue. Destaca por ganar balones divididos por pura fuerza."
  },
  "M. Chávez": {
    nickname: "El Tiloncito",
    subPosition: "Lateral Dinámico",
    rating: 83,
    styleOfPlay: "Joven y dinámico lateral izquierdo canterano con una proyección internacional muy interesante. Rápido, descarado y con mucha vocación ofensiva; le gusta llegar a línea de fondo y asociarse en espacios reducidos."
  },
  "Erik Lira": {
    nickname: "El Pitbull",
    subPosition: "Contención Fijo",
    rating: 84,
    styleOfPlay: "Mediocampista de contención fijo, encargado del 'trabajo sucio' y del equilibrio del equipo. Recuperador nato, incansable en la presión en toda la zona medular, pases cortos y de alta seguridad."
  },
  "Luis Romo": {
    nickname: "Romo / La Loba",
    subPosition: "Mediocampista Mixto",
    rating: 86,
    styleOfPlay: "Mediocampista mixto multifuncional de gran zancada y jerarquía en la Liga MX. Volante de área a área (box-to-box), imponente físico para disputar balones y facilidad para descolgarse por sorpresa al ataque."
  },
  "A. Fidalgo": {
    nickname: "El Maguito / El Conde",
    subPosition: "Mediocampista Creativo",
    rating: 88,
    styleOfPlay: "Mediocampista creativo de excelsa calidad técnica, motor dinámico y cerebro organizador. Orquestador del juego, retención de balón impecable bajo presión, giros rápidos y excelente distribución de juego."
  },
  "O. Pineda": {
    nickname: "El Maguito / El Orbe",
    subPosition: "Volante Alegre",
    rating: 86,
    styleOfPlay: "Volante ofensivo alegre, sumamente móvil y desequilibrante, consolidado en Europa. Dinámico, escurridizo y muy asociativo. Regate corto preciso y cambio de ritmo explosivo en tres cuartos de cancha."
  },
  "Luis Chávez": {
    nickname: "El Zurdo",
    subPosition: "Mediocampista Organizador",
    rating: 87,
    styleOfPlay: "Mediocampista organizador con uno de los mejores golpeos de balón de larga distancia del continente. Golpeo de balón privilegiado, especialista en tiros libres y trazos largos milimétricos para cambiar de frente."
  },
  "Obed Vargas": {
    nickname: "Obed",
    subPosition: "Joven Volante",
    rating: 85,
    styleOfPlay: "Joven mediocampista con doble nacionalidad, una de las grandes joyas con proyección europea. Mediocampista moderno box-to-box, gran resistencia aeróbica, manejo maduro del balón y juego asociativo fluido."
  },
  "B. Gutiérrez": {
    nickname: "Guti",
    subPosition: "Volante Dinámico",
    rating: 84,
    styleOfPlay: "Volante dinámico con buen manejo de balón, visión de campo y distribución en el medio campo. Inteligencia táctica, excelente distribución limpia del balón, pases entrelíneas y buen apoyo en coberturas."
  },
  "G. Mora": {
    nickname: "Gilbertiño",
    subPosition: "Joya Juvenil",
    rating: 85,
    styleOfPlay: "La última gran joya juvenil del fútbol mexicano, debutante y anotador a una edad extremadamente temprana. Descarado, ágil, centro de gravedad bajo para cambiar de dirección con facilidad y gran visión para el último pase."
  },
  "Raúl Jiménez": {
    nickname: "El Lobo de Tepeji",
    subPosition: "Delantero de Élite",
    rating: 89,
    styleOfPlay: "Delantero centro de élite histórica para México, referente de resiliencia en la Premier League. Prototipo de delantero asociativo, excelente juego de espaldas, remate de cabeza letal y cobrador de penales infalible."
  },
  "G. Martínez": {
    nickname: "El Memote",
    subPosition: "Delantero Tanque",
    rating: 85,
    styleOfPlay: "Ariete nominal de área, consolidado como el delantero tanque por excelencia del país. Clásico '9' de área, delantero boya que aprovecha su gran estatura para pivotear balones difíciles y rematar de cabeza."
  },
  "S. Giménez": {
    nickname: "El Bebote / Santi",
    subPosition: "Referente del Gol",
    rating: 91,
    styleOfPlay: "Referente del gol joven en Europa, atacante con un instinto feroz y olfato goleador letal. Movedizo, desmarques de ruptura destructivos a la espalda de centrales, potencia en carrera corta y definición de primera."
  },
  "A. González": {
    nickname: "La Hormiga",
    subPosition: "Joven Delantero",
    rating: 84,
    styleOfPlay: "Joven delantero con una efectividad goleadora impresionante en categorías menores y rápida adaptación. Despliegue de energía incansable, presión alta a defensores e intuición perfecta para cazar rebotes en el área."
  },
  "J. Quiñones": {
    nickname: "La Pantera / Súper Sayayín",
    subPosition: "Atacante Potente",
    rating: 88,
    styleOfPlay: "Atacante sumamente potente y veloz, multicampeón de la Liga MX con un físico dominante. Fuerza de la naturaleza, letal jugando por banda izquierda hacia el centro, velocidad implacable y disparo potente."
  },
  "C. Huerta": {
    nickname: "El Chino",
    subPosition: "Extremo Incisivo",
    rating: 87,
    styleOfPlay: "Extremo izquierdo, uno de los jugadores más determinantes por su entrega absoluta y espíritu combativo. Encarador descarado, busca el mano a mano constante, regate impredecible hacia adentro y presión defensiva obsesiva."
  },
  "R. Alvarado": {
    nickname: "El Piojo",
    subPosition: "Atacante Polivalente",
    rating: 86,
    styleOfPlay: "Atacante sumamente creativo, polivalente e inteligente, motor de ataque de su equipo. Excelente toma de decisiones, polivalencia táctica por bandas o centro, regate elegante y gran visión de asistente."
  },
  "Alexis Vega": {
    nickname: "El Gru",
    subPosition: "Atacante Técnico",
    rating: 87,
    styleOfPlay: "Atacante de enorme talento técnico e individual, capaz de cambiar el rumbo del juego con su golpeo. Habilidoso para el recorte hacia el centro, potente disparo de media y larga distancia colocado, especialista a balón parado."
  }
};

// Generates correct factual metadata from the compressed records.
// Standard positions distribution: GK, DF, MF, FW.
export function getFactualPlayers(countryName: string): any[] | null {
  const data = COMPRESSED_SQUADS[countryName]
    || SQUADS_PART2[countryName]
    || SQUADS_PART3[countryName]
    || SQUADS_PART4[countryName];
  if (!data) return null;
  
  let records = data.split(";");
  
  return records.map((rec, index) => {
    const [rawRealName, pos, club, heightStr, birthYearStr] = rec.split("|");
    
    // Clean-up any positional codes "PO ", "DF ", "MC ", "DC ", "PO|", "DF|", "GK|", "FW|", etc. from OCR raw imports
    const realName = rawRealName.replace(/^(PO\s*|DF\s*|MC\s*|DC\s*|PO\|\s*|DF\|\s*|MC\|\s*|DC\|\s*|GK\|\s*|FW\|\s*|GK\s*|FW\s*)/i, "").trim();
    
    // Check if we have premium custom data for Mexico
    const mexData = (countryName === "México") ? MEXICO_PLAYERS_MAP[realName] : null;

    const height = parseInt(heightStr);
    const birthYear = parseInt(birthYearStr);
    const age = 2026 - birthYear;
    
    // Weight calculation approximation
    const weight = Math.round(height - 110 + (index % 5));
    
    // Dominant foot
    const dominantFoot = index % 3 === 0 ? "Izquierdo" : "Derecho";

    // Normalize POSITION to exact type 'GK' | 'DF' | 'MF' | 'FW'
    let cleanPos: 'GK' | 'DF' | 'MF' | 'FW' = "DF";
    const rawPosUpper = (pos || "").trim().toUpperCase();
    if (rawPosUpper.includes("GK") || rawPosUpper.includes("PO") || rawPosUpper.includes("POR")) {
      cleanPos = "GK";
    } else if (rawPosUpper.includes("DF") || rawPosUpper.includes("DEF")) {
      cleanPos = "DF";
    } else if (rawPosUpper.includes("MF") || rawPosUpper.includes("MC") || rawPosUpper.includes("MED")) {
      cleanPos = "MF";
    } else if (rawPosUpper.includes("FW") || rawPosUpper.includes("DC") || rawPosUpper.includes("DEL") || rawPosUpper.includes("ATA")) {
      cleanPos = "FW";
    }
    
    // Generates a descriptive / athletic generic label based on football position index:
    const gkNames = ["La Muralla Certera", "Reflejo de Gato", "El Cerrojero", "Vuelo Espectacular"];
    const dfNames = ["El Zaguero Férreo", "Fuerza Lateral", "Anticipador Central", "Escudo Defensivo", "El Líder de Línea"];
    const mfNames = ["Intermedio Creativo", "La Brújula Táctica", "El Motor Mixto", "Volante Progresivo", "El Enlace Milimétrico"];
    const fwNames = ["El Goleador Nato", "Extremo Veloz", "El Tanque de Área", "La Promesa Ofensiva", "Punta de Lanza"];

    let positionLabels = dfNames;
    if (cleanPos === "GK") positionLabels = gkNames;
    else if (cleanPos === "MF") positionLabels = mfNames;
    else if (cleanPos === "FW") positionLabels = fwNames;

    const label = positionLabels[index % positionLabels.length];
    const name = `${label} ${index + 1}`;
    
    // Rating distribution
    let rating = 72;
    if (index < 5) rating = 88 - (index * 2); // Stars
    else if (index < 15) rating = 80 - ((index - 5) % 8); // Backups
    else rating = 69 - ((index - 15) % 6); // Reserves
    
    const styleOfPlay = `${cleanPos === "GK" ? "Portero con gran sentido de anticipación y estirada." : cleanPos === "DF" ? "Defensor ordenado y solvente en los retrocesos tácticos." : cleanPos === "MF" ? "Mediocampista con excelente lectura de coberturas de apoyo." : "Atacante agresivo para atacar los espacios libres."}`;

    const isRonaldo = realName === "C. Ronaldo";
    const isMessi = realName === "L. Messi";
    const isGimenez = realName === "S. Giménez" && countryName === "México";
    const isWilliams = realName === "R. Williams" && countryName === "Sudáfrica";
    const isDavies = realName === "A. Davies" && countryName === "Canadá";
    const isDzeko = realName === "Edin Dzeko" && countryName === "Bosnia y Herzegovina";
    const isPulisic = realName === "Christian Pulisic" && countryName === "Estados Unidos";
    const isAlmiron = realName === "Miguel Almiron" && countryName === "Paraguay";

    let customImageUrl: string | undefined = undefined;

    // Adapt with images for superstars across participating countries using pre-existing premium illustration files
    if (countryName === "Argentina") {
      if (realName === "L. Messi") {
        customImageUrl = "/src/assets/images/messi_sticker_1781136475446.png";
      }
    } else if (countryName === "Portugal") {
      if (realName === "C. Ronaldo") {
        customImageUrl = "/src/assets/images/ronaldo_sticker_1781135876376.png";
      }
    } else if (countryName === "España") {
      if (realName === "Nico Williams") {
        customImageUrl = "/src/assets/images/williams_sticker_1781155661686.png";
      }
    } else if (countryName === "Uruguay") {
      if (realName === "J.M. Giménez") {
        customImageUrl = "/src/assets/images/gimenez_sticker_1781155648175.png";
      }
    } else if (countryName === "Canadá") {
      if (realName === "A. Davies") {
        customImageUrl = "/src/assets/images/davies_sticker_1781155676386.png";
      }
    } else if (countryName === "Bosnia y Herzegovina") {
      if (realName === "Edin Dzeko") {
        customImageUrl = "/src/assets/images/dzeko_sticker_1781155689186.png";
      }
    } else if (countryName === "Estados Unidos") {
      if (realName === "Christian Pulisic") {
        customImageUrl = "/src/assets/images/pulisic_sticker_1781155701013.png";
      }
    } else if (countryName === "Paraguay") {
      if (realName === "Miguel Almiron") {
        customImageUrl = "/src/assets/images/almiron_sticker_1781155714472.png";
      }
    } else if (countryName === "Ecuador") {
      if (realName === "Enner Valencia") {
        customImageUrl = "/src/assets/images/valencia_sticker_1781178272322.png";
      } else if (realName === "Moises Caicedo") {
        customImageUrl = "/src/assets/images/caicedo_sticker_1781178285081.png";
      } else if (realName === "Piero Hincapie") {
        customImageUrl = "/src/assets/images/hincapie_sticker_1781178296373.png";
      } else if (realName === "Pervis Estupinan") {
        customImageUrl = "/src/assets/images/estupinan_sticker_1781178308826.png";
      } else if (realName === "Kendry Paez") {
        customImageUrl = "/src/assets/images/paez_sticker_1781178321218.png";
      } else if (realName === "Gonzalo Plata") {
        customImageUrl = "/src/assets/images/plata_sticker_1781178333457.png";
      } else if (realName === "Willian Pacho") {
        customImageUrl = "/src/assets/images/pacho_sticker_1781178346564.png";
      } else if (realName === "Felix Torres") {
        customImageUrl = "/src/assets/images/pacho_sticker_1781178346564.png";
      } else if (realName === "Michael Estrada") {
        customImageUrl = "/src/assets/images/valencia_sticker_1781178272322.png";
      } else if (realName === "Romario Ibarra") {
        customImageUrl = "/src/assets/images/caicedo_sticker_1781178285081.png";
      } else if (realName === "H. Galindez" || realName === "Moises Ramirez" || realName === "Gonzalo Valle") {
        customImageUrl = "/src/assets/images/galindez_sticker_1781178360351.png";
      } else {
        // Rotated high-fidelity comic images by position
        if (cleanPos === "GK") {
          customImageUrl = "/src/assets/images/galindez_sticker_1781178360351.png";
        } else if (cleanPos === "DF") {
          const alternations = [
            "/src/assets/images/hincapie_sticker_1781178296373.png",
            "/src/assets/images/estupinan_sticker_1781178308826.png",
            "/src/assets/images/pacho_sticker_1781178346564.png"
          ];
          customImageUrl = alternations[index % alternations.length];
        } else if (cleanPos === "MF") {
          const alternations = [
            "/src/assets/images/caicedo_sticker_1781178285081.png",
            "/src/assets/images/paez_sticker_1781178321218.png"
          ];
          customImageUrl = alternations[index % alternations.length];
        } else {
          // FW
          const alternations = [
            "/src/assets/images/valencia_sticker_1781178272322.png",
            "/src/assets/images/plata_sticker_1781178333457.png"
          ];
          customImageUrl = alternations[index % alternations.length];
        }
      }
    }



    // Define unique specifications requested: nickname, descriptiveTitle, shirtNumber, and actionAnimation properties
    let nickname = realName;
    let descriptiveTitle = cleanPos === "GK" ? "El Guardián" : cleanPos === "DF" ? "El Defensor Central" : cleanPos === "MF" ? "El Mediocampista Mixto" : "El Cazador de Goles";
    let shirtNumber = (index % 23) + 2; // general fallback
    if (cleanPos === "GK") shirtNumber = index === 0 ? 1 : 12;

    let actionAnimation = `${realName} cubriendo el terreno de juego con alta intensidad y espíritu competitivo.`;

    if (countryName === "Argentina") {
      if (realName === "L. Messi") {
        nickname = "La Pulga";
        descriptiveTitle = "El Astro Argentino";
        shirtNumber = 10;
        actionAnimation = "La Pulga cobrando un tiro libre espectacular con rosca y comba perfecta superando la barrera directo al ángulo izquierdo.";
      } else if (realName === "E. Martínez") {
        nickname = "El Dibu";
        descriptiveTitle = "El Guardián Mental";
        shirtNumber = 23;
        actionAnimation = "Dibu volando acrobáticamente para desviar un tiro raso contra el palo izquierdo y celebrando con su baile icónico.";
      } else if (realName === "L. Martínez" && cleanPos === "FW") {
        nickname = "El Toro";
        descriptiveTitle = "El Atacante de Hierro";
        shirtNumber = 22;
        actionAnimation = "El Eléctrico Toro fusilando al arquero rival mediante una espectacular media tijera en el área chica.";
      } else if (realName === "L. Martínez" && cleanPos === "DF") {
        nickname = "Licha";
        descriptiveTitle = "The Butcher Defensivo";
        shirtNumber = 25;
        actionAnimation = "Licha lanzándose en una barrida temeraria e impecable para ahogar el grito de gol contrario.";
      } else if (realName === "J. Álvarez") {
        nickname = "La Araña";
        descriptiveTitle = "La Fuerza de Presión";
        shirtNumber = 9;
        actionAnimation = "La Araña corriendo incansablemente a presionar la salida y definiendo suave sobre el arquero contrincante.";
      } else if (realName === "R. De Paul") {
        nickname = "El Motorcito";
        descriptiveTitle = "El Escudero Albiceleste";
        shirtNumber = 7;
        actionAnimation = "Rodrigo ganando un balón dividido en el centro por pura fuerza de voluntad con barrida elíptica.";
      } else if (realName === "E. Fernández") {
        nickname = "El Gardelito";
        descriptiveTitle = "El Orquestador Joven";
        shirtNumber = 24;
        actionAnimation = "Enzo sacando un disparo lejano con efecto envenenado que se cuela sutilmente en la escuadra.";
      } else if (realName === "A. Mac Allister") {
        nickname = "Colo Mac Allister";
        descriptiveTitle = "La Brújula del Medio";
        shirtNumber = 20;
        actionAnimation = "Alexis filtrando un pase bombeado de primera intención rompiendo todo el esquema defensivo rival.";
      } else if (realName === "C. Romero") {
        nickname = "El Cuti";
        descriptiveTitle = "La Muralla de Córdoba";
        shirtNumber = 13;
        actionAnimation = "Cuti anticipando a tres metros de su zona y cortando de cabeza de manera imperial e inquebrantable.";
      } else if (realName === "N. Otamendi") {
        nickname = "El General";
        descriptiveTitle = "El Caudillo de Mil Batallas";
        shirtNumber = 19;
        actionAnimation = "El General elevándose heroicamente para conectar un cabezazo fulminante alejando el peligro de su valla.";
      } else if (realName === "N. Tagliafico") {
        nickname = "Nico Tagliafico";
        descriptiveTitle = "El Guerrero Noble";
        shirtNumber = 3;
        actionAnimation = "Nico lanzándose sobre la raya con todo para interceptar un servicio difícil y salvar la posesión.";
      } else if (realName === "G. Montiel") {
        nickname = "Cachete";
        descriptiveTitle = "El Ejecutor Supremo";
        shirtNumber = 4;
        actionAnimation = "Cachete definiendo un penal decisivo con total sangre fría raso contra el palo izquierdo.";
      }
    } else if (countryName === "Ecuador") {
      if (realName === "Moises Caicedo") {
        nickname = "El Niño Moi";
        descriptiveTitle = "El Volante de Acero";
        shirtNumber = 23;
        actionAnimation = "El Niño Moi recuperando por enésima vez la posesión con fuerza sobrehumana y descargando al flanco de ataque.";
      } else if (realName === "Piero Hincapie") {
        nickname = "Piero H.";
        descriptiveTitle = "El Kaiser de Esmeraldas";
        shirtNumber = 3;
        actionAnimation = "Piero despejando el balón sobre la línea de gol con una acrobacia plástica excelsa de cómic.";
      } else if (realName === "Enner Valencia") {
        nickname = "Superman";
        descriptiveTitle = "El Goleador Histórico";
        shirtNumber = 13;
        actionAnimation = "Superman elevándose con impulso supremo sobre los zagueros rivales y conectando un frentazo demoledor rumbo a las mallas.";
      } else if (realName === "Pervis Estupinan") {
        nickname = "La Locomotora";
        descriptiveTitle = "El Rayo Sónico de la Banda";
        shirtNumber = 7;
        actionAnimation = "Pervis desbordando a velocidad luz por el carril izquierdo y mandando un centro templado exquisito.";
      } else if (realName === "Kendry Paez") {
        nickname = "La Joya Páez";
        descriptiveTitle = "El Niño Prodigio";
        shirtNumber = 10;
        actionAnimation = "La Joya dejando desparramado a su marcador con una finta magistral y clavándola al ángulo de zurda.";
      } else if (realName === "Gonzalo Plata") {
        nickname = "Gonzalito";
        descriptiveTitle = "Hechicero del Regate";
        shirtNumber = 19;
        actionAnimation = "Gonzalo mareando a la zaga con regates en corto y cambios de ritmo espectaculares por la punta derecha.";
      } else if (realName === "Willian Pacho") {
        nickname = "El Muro Pacho";
        descriptiveTitle = "La Trinchera Infranqueable";
        shirtNumber = 6;
        actionAnimation = "El Muro reventando la jugada y desarmando al rival con solvencia física impecable.";
      } else if (realName === "H. Galindez") {
        nickname = "Hernán G.";
        descriptiveTitle = "El Comandante de Red";
        shirtNumber = 1;
        actionAnimation = "Hernán estirándose en el aire de forma espectacular para despejar un remate potentísimo a mano cambiada.";
      } else if (realName === "Felix Torres") {
        nickname = "La Torre Torres";
        descriptiveTitle = "Muro de Altura";
        shirtNumber = 2;
        actionAnimation = "Felix cabeceando un saque de esquina ofensivo con brutal dinamita directo al fonde de la red.";
      } else if (realName === "Romario Ibarra") {
        nickname = "Romario I.";
        descriptiveTitle = "El Volante Maestro";
        shirtNumber = 11;
        actionAnimation = "Romario limpiando la jugada en banda con un sutil enganche hacia adentro para el disparo de tres dedos.";
      } else if (realName === "Michael Estrada") {
        nickname = "El Tanque Estrada";
        descriptiveTitle = "La Fuerza del Choque";
        shirtNumber = 9;
        actionAnimation = "Michael resistiendo la embestida física y sacando un remate seco y potentísimo rompe-arcos.";
      } else if (realName === "Jordy Alcivar") {
        nickname = "Jordy";
        descriptiveTitle = "El Orquestador Balón Parado";
        shirtNumber = 8;
        actionAnimation = "Jordy ejecutando un tiro de esquina con rosca perfecta y comba invertida sublime.";
      } else if (realName === "Moises Ramirez") {
        nickname = "La Araña";
        descriptiveTitle = "La Elasticidad Hecha Reflejo";
        shirtNumber = 22;
        actionAnimation = "La Araña estirándose felinamente para interceptar un disparo que llevaba sello directo de gol.";
      } else if (realName === "Gonzalo Valle") {
        nickname = "Gonzalo V.";
        descriptiveTitle = "El Cerrojo Emergente";
        shirtNumber = 12;
        actionAnimation = "Gonzalo adivinando con gran intuición el achique uno contra uno al ariete oponente.";
      } else if (realName === "Alan Minda") {
        nickname = "La Bala Minda";
        descriptiveTitle = "El Velocista de Quito";
        shirtNumber = 18;
        actionAnimation = "Minda rompiendo la cadera del central en un contragolpe sónico para definir suave de tres dedos.";
      } else if (realName === "Pedro Vite") {
        nickname = "Pedrito";
        descriptiveTitle = "El Conector Creativo";
        shirtNumber = 21;
        actionAnimation = "Pedro sirviendo un pase milimétrico entre líneas filtrado de tres dedos descolocando al rival.";
      } else if (realName === "Jordy Caicedo") {
        nickname = "Jordy C.";
        descriptiveTitle = "La Locomotora de Choque";
        shirtNumber = 15;
        actionAnimation = "Jordy barriendo con potencia al lateral para ingresar frontal al área chica.";
      } else if (realName === "Angelo Preciado") {
        nickname = "Angelo P.";
        descriptiveTitle = "El Carrilero Flecha";
        shirtNumber = 17;
        actionAnimation = "Angelo cruzando toda la banda derecha en un carrerón de área a área espectacular.";
      } else if (realName === "Denil Castillo") {
        nickname = "El Pulpo Castillo";
        descriptiveTitle = "La Tenaza del Medio";
        shirtNumber = 5;
        actionAnimation = "Denil interceptando el balón con elegancia táctica soberbia en el círculo central.";
      } else if (realName === "Nilson Angulo") {
        nickname = "Pepito Angulo";
        descriptiveTitle = "El Juvenil Atrevido";
        shirtNumber = 20;
        actionAnimation = "Nilson inventándose un autopase por aire precioso en una baldosa táctica.";
      } else if (realName === "Alan Franco") {
        nickname = "La Aspiradora Franco";
        descriptiveTitle = "El Volante Incansable";
        shirtNumber = 21;
        actionAnimation = "Alan presionando de manera frenética para forzar el error y robar la posesión limpia.";
      } else if (realName === "Jeremy Arevalo") {
        nickname = "La Flecha Arevalo";
        descriptiveTitle = "La Promesa de Aire";
        shirtNumber = 24;
        actionAnimation = "Jeremy rematando de bolea un pase de globo precioso hacia las redes contrarias.";
      } else if (realName === "Jackson Porozo") {
        nickname = "La Roca Porozo";
        descriptiveTitle = "El Baluarte del Área";
        shirtNumber = 4;
        actionAnimation = "Jackson saltando con tremenda imponencia corporal para despejar todo de cabeza.";
      } else if (realName === "Yaimar Medina") {
        nickname = "La Zurda Yaimar";
        descriptiveTitle = "El Cañón de Esmeraldas";
        shirtNumber = 14;
        actionAnimation = "Yaimar soltando un disparo fortísimo con su zurda mágica de tiro libre superando la barrera.";
      }
    }

    const defaultRating = rating;
    let finalRating = mexData 
      ? mexData.rating
      : (isRonaldo 
          ? 98 
          : isMessi 
            ? 99 
            : isGimenez
              ? 90
              : isWilliams
                ? 92
                : isDavies
                  ? 94
                  : isDzeko
                    ? 95
                    : isPulisic
                      ? 93
                      : isAlmiron
                        ? 91
                        : defaultRating);

    if (countryName === "Ecuador") {
      if (realName === "Moises Caicedo") finalRating = 94;
      else if (realName === "Piero Hincapie") finalRating = 92;
      else if (realName === "Enner Valencia") finalRating = 91;
      else if (realName === "Pervis Estupinan") finalRating = 90;
      else if (realName === "Kendry Paez") finalRating = 89;
      else if (realName === "Willian Pacho") finalRating = 88;
      else if (realName === "Gonzalo Plata") finalRating = 87;
      else if (realName === "Felix Torres") finalRating = 85;
      else if (realName === "Romario Ibarra") finalRating = 86;
      else if (realName === "Michael Estrada") finalRating = 89;
      else if (cleanPos === "GK") finalRating = 84;
      else finalRating = Math.max(81, finalRating); // Boost Ecuador elements
    }

    let finalSubPosition = mexData
      ? mexData.subPosition
      : (isRonaldo 
          ? "Extremo Izquierdo / Leyenda" 
          : isMessi 
            ? "Mediapunta / Leyenda"
            : isGimenez
              ? "Delantero de Élite"
              : isWilliams
                ? "Portero Legendario / Atajapenales"
                : isDavies
                  ? "Lateral Volador de Élite"
                  : isDzeko
                    ? "Delantero Pivot / Leyenda"
                    : isPulisic
                      ? "Extremo / Capitán América"
                      : isAlmiron
                        ? "Mediapunta Eléctrico"
                        : (cleanPos === "GK" ? "Arquero Atajador" : cleanPos === "DF" ? "Defensor Central" : cleanPos === "MF" ? "Mediocampista Box-to-Box" : "Delantero Centro"));

    if (countryName === "Ecuador") {
      if (realName === "Moises Caicedo") finalSubPosition = "Volante de Acero Comic";
      else if (realName === "Piero Hincapie") finalSubPosition = "Muro de Defensa";
      else if (realName === "Enner Valencia") finalSubPosition = "Capitán y Goleador";
      else if (realName === "Pervis Estupinan") finalSubPosition = "Lateral Veloz";
      else if (realName === "Kendry Paez") finalSubPosition = "Niño Prodigio de Élite";
      else if (realName === "Gonzalo Plata") finalSubPosition = "Talento Eléctrico";
      else if (realName === "Willian Pacho") finalSubPosition = "Guardián de Hierro";
      else if (realName === "H. Galindez") finalSubPosition = "Guardián de Red";
      else if (realName === "Felix Torres") finalSubPosition = "Torre Central";
      else if (realName === "Romario Ibarra") finalSubPosition = "Volante Maestro";
      else if (realName === "Michael Estrada") finalSubPosition = "Delantero Potente";
    }

    let finalStyle = mexData
      ? mexData.styleOfPlay
      : (isRonaldo 
          ? "Máxima leyenda del fútbol. Definición inigualable, potencia de remate, cabezazo implacable y mentalidad competitiva de acero." 
          : isMessi 
            ? "El mejor creador de juego de la historia. Regate hipnótico, pases quirúrgicos de otro planeta, definición perfecta y una visión táctica divina."
            : isGimenez
              ? "Goleador voraz y físico en el área. Gran olfato de gol, agilidad de espaldas al arco y remate letal de primera intención."
              : isWilliams
                ? "Héroe absoluto de la portería sudafricana. Extraordinaria agilidad, reflejos felinos y especialista en tandas de penales históricos."
                : isDavies
                  ? "La bala canadiense. Velocidad Supersónica implacable por la banda, regates electrizantes y recuperación defensiva asombrosa."
                  : isDzeko
                    ? "El Diamante de Sarajevo. Inteligencia táctica suprema, juego aéreo demoledor y definición perfecta con ambas piernas."
                    : isPulisic
                      ? "El revulsivo norteamericano. Regate incisivo, cambio de ritmo brutal, gran visión de pase de gol y liderazgo puro en ataque."
                      : isAlmiron
                        ? "La sonrisa paraguaya. Veloz conducción en contragolpe, visión de juego filtrada y gran despliegue dinámico de ida y vuelta."
                        : styleOfPlay);

    if (countryName === "Ecuador") {
      if (realName === "Moises Caicedo") {
        finalStyle = "Baluarte indestructible. Corta ataques contrarios con ráfagas de energía súper héroe y distribuye balones con precisión de rayo láser.";
      } else if (realName === "Piero Hincapie") {
        finalStyle = "Intercepciones: 35+ | Despejes: 30+. Escudo protector impenetrable con habilidades aéreas insuperables.";
      } else if (realName === "Enner Valencia") {
        finalStyle = "Goles L.: 30+ | Goles Club: 100+. Máxima leyenda atacante de la Tricolor en el torneo.";
      } else if (realName === "Pervis Estupinan") {
        finalStyle = "Asistencias: 10+ | Recuperaciones: 55+. Locomotora sónica por la banda banda izquierda.";
      } else if (realName === "Kendry Paez") {
        finalStyle = "El joven ilusionista con pinceladas de genialidad. Dribla en un pixel y visualiza tácticas mágicas.";
      } else if (realName === "Gonzalo Plata") {
        finalStyle = "Regates: 45+ | Ocasiones: 25+. Hechicero del drible corto, con fintas electrizantes de novela gráfica.";
      } else if (realName === "Willian Pacho") {
        finalStyle = "Torre de control y fuerza táctica. Impenetrable en el cuerpo a cuerpo y barridas.";
      } else if (realName === "H. Galindez") {
        finalStyle = "Paradas: 100+ | Porterías 0: 15+. Estiradas felinas que parecen levitación cinematográfica de cómic clásico.";
      } else if (realName === "Felix Torres") {
        finalStyle = "Tackles: 40+ | Bloqueos: 25+. Torre central inexpugnable, ganando todo por arriba.";
      } else if (realName === "Romario Ibarra") {
        finalStyle = "Pases Clave: 20+ | Creaciones: 30+. Volante maestro con excelente conducción y visión periférica.";
      } else if (realName === "Michael Estrada") {
        finalStyle = "Goles: 12+ | Remates: 60+. Atacante de zancada imparable y demoledor en el juego directo.";
      } else {
        finalStyle = `Héroe del fútbol ecuatoriano en el rol de ${cleanPos}. Aporta energía vibrante de cómic y solvencia táctica en el Torneo 2026.`;
      }
    }

    let finalComicName = name;
    if (countryName === "Ecuador") {
      if (realName === "Moises Caicedo") finalComicName = "El Niño Moi";
      else if (realName === "Piero Hincapie") finalComicName = "PIERO H.";
      else if (realName === "Enner Valencia") finalComicName = "ENNER V.";
      else if (realName === "Pervis Estupinan") finalComicName = "PERVIS E.";
      else if (realName === "Kendry Paez") finalComicName = "La Joya Páez";
      else if (realName === "Gonzalo Plata") finalComicName = "GONZALO P.";
      else if (realName === "Willian Pacho") finalComicName = "El Muro Pacho";
      else if (realName === "H. Galindez") finalComicName = "HERNÁN G.";
      else if (realName === "Felix Torres") finalComicName = "FÉLIX T.";
      else if (realName === "Romario Ibarra") finalComicName = "ROMARIO I.";
      else if (realName === "Michael Estrada") finalComicName = "MICHAEL E.";
    }

    return {
      id: `${countryName.substring(0,3).toLowerCase()}-${index}`,
      name: mexData
        ? mexData.nickname
        : (isRonaldo 
            ? "El Comandante Legendario" 
            : isMessi 
              ? "El D10S Legendario" 
              : isGimenez
                ? "El Chaquito Bebote"
                : isWilliams
                  ? "La Muralla de Pretoria"
                  : isDavies
                    ? "La Bala Humana"
                    : isDzeko
                      ? "El Diamante de Sarajevo"
                      : isPulisic
                        ? "Capitán América"
                        : isAlmiron
                          ? "Miggy Almirón"
                          : (countryName === "Ecuador" ? finalComicName : name)),
      realName,
      country: countryName,
      age: isRonaldo 
        ? 41 
        : isMessi 
          ? 38 
          : isGimenez
            ? 25
            : isWilliams
              ? 34
              : isDavies
                ? 25
                : isDzeko
                  ? 40
                  : isPulisic
                    ? 27
                    : isAlmiron
                      ? 32
                      : age,
      weight: isRonaldo 
        ? 83 
        : isMessi 
          ? 72 
          : isGimenez
            ? 80
            : isWilliams
              ? 79
              : isDavies
                ? 75
                : isDzeko
                  ? 84
                  : isPulisic
                    ? 73
                    : isAlmiron
                      ? 70
                      : weight,
      height: isRonaldo 
        ? 187 
        : isMessi 
          ? 170 
          : isGimenez
            ? 182
            : isWilliams
              ? 184
              : isDavies
                ? 183
                : isDzeko
                  ? 193
                  : isPulisic
                    ? 177
                    : isAlmiron
                      ? 178
                      : height,
      dominantFoot: isRonaldo 
        ? "Ambidiestro" 
        : isMessi 
          ? "Zurda Mágica" 
          : isGimenez
            ? "Zurda Potente"
            : isWilliams
              ? "Derecho Seguro"
              : isDavies
                ? "Zurda Supersónica"
                : isDzeko
                  ? "Ambidiestro Goleador"
                  : isPulisic
                    ? "Derecho Habilidoso"
                    : isAlmiron
                      ? "Sinforosa Zurda"
                      : dominantFoot,
      currentClub: club,
      rating: finalRating,
      styleOfPlay: finalStyle,
      position: cleanPos,
      subPosition: finalSubPosition,
      imageSeed: `${countryName.substring(0,2).toLowerCase()}-${cleanPos.toLowerCase()}-${index}`,
      imageUrl: customImageUrl,
      nickname,
      shirtNumber,
      actionAnimation,
      descriptiveTitle
    };
  });
}
