/* Shellfie starter library: 24 readable stories (2 per grade, per language).
   Every text here is an original simplified retelling of a public-domain source, or an original
   short text, as Sections 9-10 of the build prompt allow. Pages are hand-broken at sentence
   boundaries to roughly match the grade's words-per-page band (Section 11).
   Quiz items: k = literal | infer | vocab, a = index of the right option, ev = supporting sentence. */
window.SHELLFIE_STORIES = [

/* ───────────── ENGLISH ───────────── */

{ id:"en-k-little-red-hen", lang:"en", grade:"K", genre:"fairy", icon:"🐔",
  title:"The Little Red Hen", author:"Traditional, retelling", credit:"An original retelling of a traditional tale (public-domain source).",
  chapters:[{ pages:[
    "The little red hen found a seed.",
    "\"Who will help me plant it?\" she said.",
    "\"Not I,\" said the cat. \"Not I,\" said the dog.",
    "So she planted it all by herself.",
    "The seed grew into tall wheat.",
    "\"Who will help me cut it?\" \"Not I!\"",
    "She made the wheat into bread.",
    "\"Who will help me eat it?\" \"I will!\" said the cat and the dog.",
    "\"No,\" said the hen. \"I will eat it.\" And she did!"
  ], quiz:[
    { k:"literal", q:"What did the little red hen find?", o:["A seed","A hat","A fish"], a:0, ev:"The little red hen found a seed." },
    { k:"infer", q:"Why did the hen eat the bread by herself?", o:["Nobody helped her","She was sad","The bread was cold"], a:0, ev:"So she planted it all by herself." },
    { k:"vocab", q:"What does \"planted\" mean?", o:["Put in the ground to grow","Threw away","Ate it up"], a:0, ev:"So she planted it all by herself." }
  ]}]},

{ id:"en-k-enormous-turnip", lang:"en", grade:"K", genre:"fairy", icon:"🥕",
  title:"The Enormous Turnip", author:"Russian folk tale, retelling", credit:"An original retelling of a Russian folk tale (public-domain source).",
  chapters:[{ pages:[
    "Grandpa planted a little turnip.",
    "It grew big. It grew enormous!",
    "Grandpa pulled and pulled. It did not come up.",
    "Grandma helped. They pulled and pulled.",
    "The girl helped. The dog helped. The cat helped.",
    "Then a tiny mouse helped too.",
    "They pulled and pulled and POP!",
    "Up came the turnip! They all fell down and laughed."
  ], quiz:[
    { k:"literal", q:"Who planted the turnip?", o:["Grandpa","The cat","The girl"], a:0, ev:"Grandpa planted a little turnip." },
    { k:"infer", q:"Why did the turnip come up at last?", o:["Everyone pulled together","It rained","The dog dug it"], a:0, ev:"Then a tiny mouse helped too." },
    { k:"vocab", q:"What does \"enormous\" mean?", o:["Very, very big","Very small","Very fast"], a:0, ev:"It grew big. It grew enormous!" }
  ]}]},

{ id:"en-1-tortoise-hare", lang:"en", grade:"1", genre:"fables", icon:"🐢",
  title:"The Tortoise and the Hare", author:"Aesop, retelling", credit:"Retold from The Aesop for Children (1919), public domain.",
  chapters:[{ pages:[
    "A hare liked to brag. \"I am the fastest!\" he said. \"Nobody can beat me.\"",
    "A tortoise looked up. \"I will race you,\" she said. All the animals laughed.",
    "The race began. The hare zoomed away. The tortoise walked slow and steady.",
    "The hare looked back. \"She is so far away,\" he said. \"I will take a nap.\"",
    "The tortoise did not stop. Step, step, step. She walked past the sleeping hare.",
    "The hare woke up and ran fast. But the tortoise was already at the finish line!",
    "\"Slow and steady wins the race,\" said the tortoise with a smile."
  ], quiz:[
    { k:"literal", q:"What did the hare do in the middle of the race?", o:["Took a nap","Ate lunch","Went home"], a:0, ev:"\"I will take a nap.\"" },
    { k:"infer", q:"Why did the tortoise win?", o:["She never stopped","She could run fast","The hare let her win"], a:0, ev:"The tortoise did not stop." },
    { k:"vocab", q:"What does \"brag\" mean?", o:["Say you are better than others","Help a friend","Run very fast"], a:0, ev:"A hare liked to brag." }
  ]}]},

{ id:"en-1-lion-mouse", lang:"en", grade:"1", genre:"fables", icon:"🦁",
  title:"The Lion and the Mouse", author:"Aesop, retelling", credit:"Retold from The Aesop for Children (1919), public domain.",
  chapters:[{ pages:[
    "A big lion was asleep in the sun. A little mouse ran over his nose.",
    "The lion woke up and grabbed the mouse. \"I will eat you!\" he roared.",
    "\"Please let me go,\" said the mouse. \"Some day I will help you.\"",
    "The lion laughed. \"How can a tiny mouse help me?\" But he let her go.",
    "One day the lion was caught in a rope net. He roared and roared.",
    "The mouse heard him. She chewed the rope with her sharp teeth.",
    "Snip, snap! The lion was free. \"Thank you, little friend,\" he said."
  ], quiz:[
    { k:"literal", q:"How did the mouse help the lion?", o:["She chewed the net","She called for help","She gave him food"], a:0, ev:"She chewed the rope with her sharp teeth." },
    { k:"infer", q:"What did the lion learn?", o:["Small friends can help too","Mice are scary","Nets are fun"], a:0, ev:"\"Thank you, little friend,\" he said." },
    { k:"vocab", q:"What does \"roared\" mean?", o:["Made a big loud sound","Whispered","Fell asleep"], a:0, ev:"He roared and roared." }
  ]}]},

{ id:"en-2-princess-pea", lang:"en", grade:"2", genre:"fairy", icon:"👑",
  title:"The Princess and the Pea", author:"Hans Christian Andersen, retelling", credit:"Retold from a public-domain translation of Hans Christian Andersen.",
  chapters:[{ pages:[
    "Once there was a prince who wanted to marry a real princess. He traveled all over the world to find one. He met many princesses, but something always seemed wrong.",
    "One stormy night, there was a knock at the castle gate. A girl stood in the rain. Water ran down her hair and into her shoes. \"I am a real princess,\" she said.",
    "The old queen did not say a word. She went to the guest room and put one tiny pea on the bed. Then she piled twenty mattresses on top of the pea, and twenty feather quilts on top of those.",
    "In the morning, the queen asked, \"How did you sleep?\" \"Terribly!\" said the princess. \"Something hard was in my bed. I am black and blue all over!\"",
    "Only a real princess could feel a pea through forty soft layers. The prince married her at once, and the pea was put in a museum, where you may still see it."
  ], quiz:[
    { k:"literal", q:"What did the queen put under the mattresses?", o:["A pea","A rock","A key","A crown"], a:0, ev:"put one tiny pea on the bed" },
    { k:"infer", q:"Why did the queen use a pea?", o:["To test if she was a real princess","To make a snack","To trick the prince","To grow a plant"], a:0, ev:"Only a real princess could feel a pea through forty soft layers." },
    { k:"vocab", q:"What are \"mattresses\"?", o:["Soft pads you sleep on","Rain boots","Castle doors","Tiny peas"], a:0, ev:"Then she piled twenty mattresses on top of the pea" }
  ]}]},

{ id:"en-2-bremen", lang:"en", grade:"2", genre:"fairy", icon:"🎺",
  title:"The Bremen Town Musicians", author:"Brothers Grimm, retelling", credit:"Retold from a public-domain translation of the Brothers Grimm.",
  chapters:[{ pages:[
    "An old donkey was too tired to carry heavy sacks. \"I will go to the town of Bremen,\" he said, \"and become a musician!\"",
    "On the road he met a dog, a cat, and a rooster. Each one was old, and each one was sad. \"Come with me,\" said the donkey. \"We will make music together.\"",
    "At night they saw a light in the woods. It was a house full of robbers eating a big dinner. The hungry animals made a plan.",
    "The dog climbed on the donkey. The cat climbed on the dog. The rooster flew on top. Then they all sang at once: Hee-haw! Woof! Meow! Cock-a-doodle-doo!",
    "The robbers thought a monster had come! They ran away into the dark woods. The four friends ate the dinner and liked the house so much that they stayed there forever."
  ], quiz:[
    { k:"literal", q:"Where did the donkey want to go?", o:["Bremen","The beach","The castle","The farm"], a:0, ev:"\"I will go to the town of Bremen,\"" },
    { k:"infer", q:"Why did the robbers run away?", o:["They thought a monster came","They were full","It started to rain","They wanted music"], a:0, ev:"The robbers thought a monster had come!" },
    { k:"vocab", q:"What is a \"musician\"?", o:["Someone who makes music","Someone who robs","A kind of donkey","A big house"], a:0, ev:"and become a musician!" }
  ]}]},

{ id:"en-3-emperor", lang:"en", grade:"3", genre:"fairy", icon:"🧥",
  title:"The Emperor's New Clothes", author:"Hans Christian Andersen, retelling", credit:"Retold from a public-domain translation of Hans Christian Andersen.",
  chapters:[{ pages:[
    "There once lived an emperor who loved new clothes more than anything. He changed his coat every hour of the day. One morning, two tricksters came to the palace. \"We weave the finest cloth in the world,\" they said. \"It is magic. Anyone who is foolish cannot see it at all.\"",
    "The emperor gave them bags of gold and silk thread. The tricksters set up empty looms and pretended to work all day and all night. When the emperor's ministers came to look, they saw nothing. But nobody wanted to seem foolish, so each one said, \"How beautiful!\"",
    "At last the emperor came to see the cloth himself. He saw nothing, either, but he said, \"Magnificent!\" The tricksters pretended to dress him in the new clothes, and the emperor marched through the town in a grand parade.",
    "Everyone in the crowd cheered, \"What wonderful clothes!\" Then a little child called out, \"But he has nothing on!\" The words spread through the crowd. Soon everyone was laughing, and the emperor knew the child was right. Still, he held his head high and walked on to the end of the parade."
  ], quiz:[
    { k:"literal", q:"Who said that the emperor had nothing on?", o:["A little child","A minister","A trickster","The emperor"], a:0, ev:"Then a little child called out, \"But he has nothing on!\"" },
    { k:"infer", q:"Why did the ministers say the cloth was beautiful?", o:["They did not want to seem foolish","They really saw it","The cloth was gold","The child told them to"], a:0, ev:"But nobody wanted to seem foolish, so each one said, \"How beautiful!\"" },
    { k:"vocab", q:"What is a \"trickster\"?", o:["Someone who fools people","A kind of king","A clothes maker who is honest","A parade"], a:0, ev:"One morning, two tricksters came to the palace." }
  ]}]},

{ id:"en-3-jack-beanstalk", lang:"en", grade:"3", genre:"fairy", icon:"🌱",
  title:"Jack and the Beanstalk", author:"Joseph Jacobs (1890), retelling", credit:"Retold from English Fairy Tales by Joseph Jacobs (1890), public domain.",
  chapters:[{ pages:[
    "Jack and his mother were so poor that they had only one cow left. \"Take her to market and sell her,\" said his mother. On the way, Jack met a strange old man. \"I will trade you five magic beans for that cow,\" said the man. Jack thought that sounded like a wonderful deal.",
    "His mother did not agree. \"Beans!\" she cried, and she tossed them out the window. But in the morning, a gigantic beanstalk stretched up past the clouds. Jack climbed and climbed until he reached a castle in the sky.",
    "Inside lived a giant who shouted, \"Fee-fi-fo-fum!\" Jack hid in the oven. When the giant fell asleep, Jack saw a hen that laid golden eggs. He tucked the hen under his arm and tiptoed away.",
    "The giant woke up and chased him. Jack slid down the beanstalk and shouted, \"Mother, bring the axe!\" Chop, chop, chop! The beanstalk crashed to the ground. With the hen's golden eggs, Jack and his mother were never poor again."
  ], quiz:[
    { k:"literal", q:"What did Jack trade the cow for?", o:["Five magic beans","A golden egg","A bag of gold","An axe"], a:0, ev:"\"I will trade you five magic beans for that cow,\"" },
    { k:"infer", q:"Why did Jack chop down the beanstalk?", o:["So the giant could not follow him","To make firewood","His mother was angry","It was too tall to climb"], a:0, ev:"The giant woke up and chased him." },
    { k:"vocab", q:"What does \"gigantic\" mean?", o:["Very, very large","Very old","Very green","Very fast"], a:0, ev:"a gigantic beanstalk stretched up past the clouds" }
  ]}]},

{ id:"en-4-wonder-book", lang:"en", grade:"4", genre:"fairy", icon:"✨",
  title:"A Wonder-Book: King Midas, Pandora's Box", author:"Nathaniel Hawthorne (1851), retelling", credit:"Retold from A Wonder-Book for Girls and Boys by Nathaniel Hawthorne (1851), public domain.",
  chapters:[
  { title:"The Golden Touch", pages:[
    "King Midas loved gold more than anything in the world, except perhaps his little daughter, Marygold. He spent his days in a dark room under the palace, counting coins and letting them run through his fingers. One afternoon, a shining stranger appeared beside him. \"You are a rich man,\" said the stranger. \"Are you happy?\" \"I would be happier,\" said Midas, \"if everything I touched turned to gold.\"",
    "The next morning, Midas woke to find his blanket shimmering yellow. He touched the bedpost, his spectacles, and the roses in the garden, and each one turned to solid gold. He laughed with delight. But at breakfast, his bread became a hard golden lump, and his water became a stream of metal. He could not eat a single bite.",
    "Then Marygold ran in, crying because the roses had lost their sweet smell. Midas reached out to comfort her, and in an instant she stood frozen, a golden statue with tears still on her cheeks. The king's heart broke. When the stranger returned, Midas begged, \"Take back the Golden Touch! I would give every coin I own to have my daughter back.\"",
    "The stranger told him to bathe in the river and sprinkle its water on everything he had changed. Midas ran, filled a pitcher, and poured the cool water over Marygold. Color flowed back into her cheeks. From that day on, Midas never cared for gold again, except for the golden curls of his grandchildren."
  ], quiz:[
    { k:"literal", q:"What happened when Midas touched Marygold?", o:["She turned into gold","She fell asleep","She ran away","She began to laugh"], a:0, ev:"in an instant she stood frozen, a golden statue" },
    { k:"infer", q:"What did Midas learn?", o:["Love matters more than gold","Gold is easy to eat","Strangers are dangerous","Roses are better than gold"], a:0, ev:"\"I would give every coin I own to have my daughter back.\"" },
    { k:"vocab", q:"What does \"shimmering\" mean?", o:["Shining with a soft, moving light","Falling apart","Getting very cold","Making a loud noise"], a:0, ev:"Midas woke to find his blanket shimmering yellow." }
  ]},
  { title:"Pandora's Box", pages:[
    "Long ago, when the world was new, there was no sickness and no sorrow. Children never quarreled, and nobody ever cried. A boy named Epimetheus lived in a cottage with a girl named Pandora. In the corner of their cottage sat a beautiful carved box, tied shut with a golden cord.",
    "\"What is inside the box?\" Pandora asked every single day. \"I do not know,\" said Epimetheus. \"It was left here for safekeeping. We must never open it.\" But Pandora's curiosity grew and grew, until she could think of nothing else.",
    "One day, while Epimetheus was out, Pandora untied the knot and lifted the lid. Out flew a swarm of tiny brown creatures with buzzing wings. They were Troubles: Worry, Sorrow, Grumpiness, and many more, and they stung her and flew out into the world.",
    "Pandora slammed the lid and burst into tears. Then she heard a gentle tapping from inside. \"Let me out,\" said a sweet voice. \"I can help.\" She opened the box once more, and out fluttered a bright, rainbow-winged spirit. Its name was Hope, and it has stayed with people ever since, helping them through every trouble."
  ], quiz:[
    { k:"literal", q:"What was the last thing to fly out of the box?", o:["Hope","Worry","A golden cord","Sorrow"], a:0, ev:"Its name was Hope" },
    { k:"infer", q:"Why did Pandora open the box?", o:["She was too curious to wait","Epimetheus told her to","She heard Hope calling at first","She wanted to hide something"], a:0, ev:"But Pandora's curiosity grew and grew, until she could think of nothing else." },
    { k:"vocab", q:"What does \"curiosity\" mean?", o:["Wanting very much to know something","Feeling very sleepy","Being afraid of the dark","Being kind to others"], a:0, ev:"But Pandora's curiosity grew and grew" }
  ]}]},

{ id:"en-4-hanukkah", lang:"en", grade:"4", genre:"seasons", season:"winter", icon:"🕎",
  title:"The Story of Hanukkah (nonfiction)", author:"Original, from public-domain history", credit:"An original nonfiction text written for Shellfie.",
  chapters:[{ pages:[
    "Hanukkah is a Jewish holiday that lasts for eight nights, usually in December. Its name means \"dedication.\" It remembers events that happened more than two thousand years ago in the land of Judea, around the city of Jerusalem.",
    "At that time, a king named Antiochus ruled over Judea. He made laws that forbade the Jewish people from practicing their religion. A small group led by Judah Maccabee refused to obey. After years of struggle, the Maccabees took back the great Temple in Jerusalem.",
    "The Temple had a special lamp, called a menorah, that was supposed to burn at all times. According to tradition, the people found only enough pure oil to keep it lit for one day. Yet the lamp kept burning for eight days, long enough to prepare more oil.",
    "Today, families light a menorah with eight branches, plus a helper candle called the shamash. They add one more flame each night. Many people eat foods fried in oil, such as potato latkes and jelly doughnuts, and children play with a spinning top called a dreidel."
  ], quiz:[
    { k:"literal", q:"How many nights does Hanukkah last?", o:["Eight","One","Twelve","Two"], a:0, ev:"Hanukkah is a Jewish holiday that lasts for eight nights" },
    { k:"infer", q:"Why do many families eat foods fried in oil?", o:["To remember the oil that lasted eight days","Because it is winter","Because the dreidel needs oil","Because the Temple was a kitchen"], a:0, ev:"Yet the lamp kept burning for eight days" },
    { k:"vocab", q:"What does \"forbade\" mean?", o:["Did not allow","Helped with","Forgot about","Celebrated"], a:0, ev:"He made laws that forbade the Jewish people from practicing their religion." }
  ]}]},

{ id:"en-5-gift-magi", lang:"en", grade:"5", genre:"seasons", season:"winter", icon:"🎁",
  title:"The Gift of the Magi", author:"O. Henry (1905), abridged retelling", credit:"Abridged and retold from \"The Gift of the Magi\" by O. Henry (1905), public domain.",
  chapters:[{ pages:[
    "One dollar and eighty-seven cents. That was all the money Della had, and tomorrow would be Christmas. She had saved it one penny at a time, bargaining with the grocer and the butcher until her cheeks burned. Della and her husband, Jim, lived in a small, plain apartment, but they owned two treasures they were very proud of. One was Jim's gold watch, which had belonged to his father and grandfather. The other was Della's hair, which rippled down past her knees like a shining brown waterfall.",
    "Della stood at the window and watched a gray cat walk along a gray fence. She wanted to give Jim something fine, something worthy of him. Suddenly she turned from the window. She put on her old brown jacket and hat and hurried down the street to a shop with a sign that read, \"Madame Sofronie. Hair Goods of All Kinds.\" Twenty minutes later she walked out with twenty dollars, and her beautiful hair was gone.",
    "She searched every store until she found it: a simple platinum chain for Jim's watch. It was elegant and valuable, just like Jim. At seven o'clock the door opened. Jim stepped in and stared at Della's short curls with a strange expression. \"Don't look at me that way,\" she pleaded. \"My hair grows awfully fast. I sold it to buy you a present.\"",
    "Jim drew a package from his coat. Inside lay a set of tortoiseshell combs with jeweled edges, the very combs Della had admired in a shop window for months. Now she had no long hair to wear them in. Then she held out the watch chain. Jim smiled gently. \"Della,\" he said, \"I sold the watch to buy your combs.\"",
    "The Magi were the wise men who brought gifts to a newborn child, and they invented the art of giving presents. Della and Jim had foolishly given up the greatest treasures of their home for each other. Yet of all who give gifts, the writer tells us, these two were the wisest. They are the true Magi."
  ], quiz:[
    { k:"literal", q:"What did Della sell to buy Jim's present?", o:["Her hair","Her jacket","Her combs","Her watch"], a:0, ev:"Twenty minutes later she walked out with twenty dollars, and her beautiful hair was gone." },
    { k:"infer", q:"Why does the writer call Della and Jim the wisest givers?", o:["They gave up what they loved most for each other","They found the best prices","They bought very expensive gifts","They kept their treasures safe"], a:0, ev:"Della and Jim had foolishly given up the greatest treasures of their home for each other." },
    { k:"vocab", q:"What does \"elegant\" mean?", o:["Graceful and stylish","Broken and old","Loud and bright","Heavy and dull"], a:0, ev:"It was elegant and valuable, just like Jim." },
  ]}]},

{ id:"en-5-sleepy-hollow", lang:"en", grade:"5", genre:"seasons", season:"halloween", icon:"🎃",
  title:"The Legend of Sleepy Hollow (Halloween)", author:"Washington Irving (1820), abridged retelling", credit:"Abridged and retold from \"The Legend of Sleepy Hollow\" by Washington Irving (1820), public domain.",
  chapters:[{ pages:[
    "Tucked among the hills along the Hudson River lies a quiet valley called Sleepy Hollow. The people there say a drowsy, dreamy spell hangs over the place, and they love to tell ghost stories by the fire. The most famous is the tale of the Headless Horseman, a phantom rider who gallops through the night searching for his lost head.",
    "To this valley came a schoolmaster named Ichabod Crane. He was tall and terribly thin, with long arms, enormous feet, and a neck like a crane's. Ichabod believed every ghost story he heard. He also hoped to marry Katrina Van Tassel, the cheerful daughter of a wealthy farmer. But a bold young man named Brom Bones wanted to marry Katrina too, and he loved to play pranks.",
    "One autumn evening, the Van Tassels held a grand party. There were heaps of doughnuts, pies, and roasted turkey, and the guests danced and told spooky tales late into the night. When Ichabod finally rode home on his bony old horse, Gunpowder, the woods were pitch dark, and every creaking branch made him shiver.",
    "Near the old church bridge, Ichabod noticed a huge, shadowy rider following him. When the moonlight fell across the figure, Ichabod saw with horror that it had no head! He kicked Gunpowder into a wild gallop. As he reached the bridge, the rider hurled its head straight at him, and Ichabod tumbled into the dust.",
    "The next morning, the villagers found Gunpowder grazing calmly, Ichabod's hat on the riverbank, and beside it a shattered pumpkin. Ichabod Crane was never seen in Sleepy Hollow again. Brom Bones soon married Katrina, and whenever the story was told, he laughed a little too knowingly at the part about the pumpkin."
  ], quiz:[
    { k:"literal", q:"What was found beside Ichabod's hat?", o:["A shattered pumpkin","A headless rider","A doughnut","A school book"], a:0, ev:"Ichabod's hat on the riverbank, and beside it a shattered pumpkin" },
    { k:"infer", q:"Who was most likely the Headless Horseman that night?", o:["Brom Bones","Katrina","Gunpowder","Mr. Van Tassel"], a:0, ev:"he laughed a little too knowingly at the part about the pumpkin" },
    { k:"vocab", q:"What is a \"phantom\"?", o:["A ghost","A teacher","A farmer","A bridge"], a:0, ev:"a phantom rider who gallops through the night" }
  ]}]},

/* ───────────── ESPAÑOL ───────────── */

{ id:"es-k-gallinita-roja", lang:"es", grade:"K", genre:"fairy", icon:"🐔",
  title:"La gallinita roja", author:"Tradicional, versión propia", credit:"Versión propia de un cuento tradicional (fuente de dominio público).",
  chapters:[{ pages:[
    "La gallinita roja encontró una semilla.",
    "—¿Quién me ayuda a sembrarla? —dijo.",
    "—Yo no —dijo el gato. —Yo no —dijo el perro.",
    "Entonces ella la sembró solita.",
    "La semilla creció y creció.",
    "—¿Quién me ayuda a cortar el trigo? —¡Yo no!",
    "Ella hizo un pan muy rico.",
    "—¿Quién me ayuda a comerlo? —¡Yo! —dijeron el gato y el perro.",
    "—No —dijo la gallinita—. Me lo como yo. ¡Y se lo comió!"
  ], quiz:[
    { k:"literal", q:"¿Qué encontró la gallinita roja?", o:["Una semilla","Un sombrero","Un pez"], a:0, ev:"La gallinita roja encontró una semilla." },
    { k:"infer", q:"¿Por qué se comió el pan ella solita?", o:["Nadie la ayudó","Estaba triste","El pan estaba frío"], a:0, ev:"Entonces ella la sembró solita." },
    { k:"vocab", q:"¿Qué quiere decir «sembrar»?", o:["Poner en la tierra para que crezca","Tirar a la basura","Comer"], a:0, ev:"—¿Quién me ayuda a sembrarla? —dijo." }
  ]}]},

{ id:"es-k-nabo-gigante", lang:"es", grade:"K", genre:"fairy", icon:"🥕",
  title:"El nabo gigante", author:"Cuento popular ruso, versión propia", credit:"Versión propia de un cuento popular ruso (fuente de dominio público).",
  chapters:[{ pages:[
    "El abuelo sembró un nabo pequeño.",
    "El nabo creció. ¡Creció muchísimo!",
    "El abuelo jaló y jaló. No salió.",
    "La abuela ayudó. Jalaron y jalaron.",
    "La niña ayudó. El perro y la gata ayudaron.",
    "Luego ayudó un ratoncito.",
    "Jalaron y jalaron y ¡PUM!",
    "¡Salió el nabo! Todos se cayeron y se rieron."
  ], quiz:[
    { k:"literal", q:"¿Quién sembró el nabo?", o:["El abuelo","La gata","La niña"], a:0, ev:"El abuelo sembró un nabo pequeño." },
    { k:"infer", q:"¿Por qué salió el nabo al final?", o:["Todos jalaron juntos","Llovió mucho","El perro lo escarbó"], a:0, ev:"Luego ayudó un ratoncito." },
    { k:"vocab", q:"¿Qué quiere decir «jalar»?", o:["Tirar hacia ti con fuerza","Empujar lejos","Saltar"], a:0, ev:"El abuelo jaló y jaló." }
  ]}]},

{ id:"es-1-tortuga-liebre", lang:"es", grade:"1", genre:"fables", icon:"🐢",
  title:"La tortuga y la liebre", author:"Esopo, versión propia", credit:"Versión propia de la fábula de Esopo (fuente de dominio público).",
  chapters:[{ pages:[
    "A la liebre le gustaba presumir. —¡Soy la más rápida! —decía—. Nadie me gana.",
    "La tortuga levantó la cabeza. —Te reto a una carrera —dijo. Todos los animales se rieron.",
    "Empezó la carrera. La liebre salió como un rayo. La tortuga caminó despacito, sin parar.",
    "La liebre miró atrás. —Está muy lejos —dijo—. Voy a dormir una siesta.",
    "La tortuga no se detuvo. Paso, paso, paso. Pasó junto a la liebre dormida.",
    "La liebre despertó y corrió muy rápido. ¡Pero la tortuga ya había llegado a la meta!",
    "—Despacito y sin parar se llega lejos —dijo la tortuga con una sonrisa."
  ], quiz:[
    { k:"literal", q:"¿Qué hizo la liebre a la mitad de la carrera?", o:["Durmió una siesta","Comió","Se fue a casa"], a:0, ev:"Voy a dormir una siesta." },
    { k:"infer", q:"¿Por qué ganó la tortuga?", o:["Nunca se detuvo","Corrió muy rápido","La liebre la dejó ganar"], a:0, ev:"La tortuga no se detuvo." },
    { k:"vocab", q:"¿Qué quiere decir «presumir»?", o:["Decir que eres mejor que los demás","Ayudar a un amigo","Correr rápido"], a:0, ev:"A la liebre le gustaba presumir." }
  ]}]},

{ id:"es-1-leon-raton", lang:"es", grade:"1", genre:"fables", icon:"🦁",
  title:"El león y el ratón", author:"Esopo, versión propia", credit:"Versión propia de la fábula de Esopo (fuente de dominio público).",
  chapters:[{ pages:[
    "Un león grande dormía al sol. Un ratoncito le pasó por la nariz.",
    "El león despertó y atrapó al ratón. —¡Te voy a comer! —rugió.",
    "—Por favor, suéltame —dijo el ratón—. Algún día te ayudaré.",
    "El león se rio. —¿Cómo me va a ayudar un ratón tan chiquito? —Pero lo soltó.",
    "Un día, el león cayó en una red de cuerdas. Rugió y rugió.",
    "El ratón lo oyó. Mordió las cuerdas con sus dientes filosos.",
    "¡Cric, crac! El león quedó libre. —Gracias, amiguito —le dijo."
  ], quiz:[
    { k:"literal", q:"¿Cómo ayudó el ratón al león?", o:["Mordió la red","Pidió ayuda","Le dio comida"], a:0, ev:"Mordió las cuerdas con sus dientes filosos." },
    { k:"infer", q:"¿Qué aprendió el león?", o:["Los amigos pequeños también ayudan","Los ratones dan miedo","Las redes son divertidas"], a:0, ev:"—Gracias, amiguito —le dijo." },
    { k:"vocab", q:"¿Qué quiere decir «filosos»?", o:["Que cortan muy bien","Que son suaves","Que son de colores"], a:0, ev:"Mordió las cuerdas con sus dientes filosos." }
  ]}]},

{ id:"es-2-princesa-guisante", lang:"es", grade:"2", genre:"fairy", icon:"👑",
  title:"La princesa y el guisante", author:"H. C. Andersen, versión propia", credit:"Versión propia del cuento de Hans Christian Andersen (fuente de dominio público).",
  chapters:[{ pages:[
    "Había una vez un príncipe que quería casarse con una princesa de verdad. Viajó por todo el mundo para encontrarla. Conoció a muchas princesas, pero siempre había algo que no le parecía bien.",
    "Una noche de tormenta, alguien tocó a la puerta del castillo. Afuera estaba una muchacha empapada. El agua le escurría por el pelo y le entraba en los zapatos. —Soy una princesa de verdad —dijo.",
    "La vieja reina no dijo nada. Fue al cuarto de huéspedes y puso un guisante diminuto sobre la cama. Encima colocó veinte colchones, y encima de los colchones, veinte edredones de plumas.",
    "En la mañana, la reina le preguntó: —¿Cómo dormiste? —¡Muy mal! —dijo la princesa—. Había algo duro en la cama. ¡Tengo moretones por todas partes!",
    "Solo una princesa de verdad podía sentir un guisante debajo de cuarenta capas tan suaves. El príncipe se casó con ella de inmediato, y el guisante quedó en un museo, donde todavía lo puedes ver."
  ], quiz:[
    { k:"literal", q:"¿Qué puso la reina debajo de los colchones?", o:["Un guisante","Una piedra","Una llave","Una corona"], a:0, ev:"puso un guisante diminuto sobre la cama" },
    { k:"infer", q:"¿Para qué usó la reina el guisante?", o:["Para saber si era una princesa de verdad","Para comérselo","Para engañar al príncipe","Para sembrarlo"], a:0, ev:"Solo una princesa de verdad podía sentir un guisante" },
    { k:"vocab", q:"¿Qué quiere decir «diminuto»?", o:["Muy pequeño","Muy pesado","Muy verde","Muy caliente"], a:0, ev:"puso un guisante diminuto sobre la cama" }
  ]}]},

{ id:"es-2-cempasuchil", lang:"es", grade:"2", genre:"seasons", season:"muertos", icon:"🌼",
  title:"La leyenda del cempasúchil (Día de Muertos)", author:"Leyenda mexica de Xóchitl y Huitzilin, versión propia", credit:"Versión propia de una leyenda mexica (fuente de dominio público).",
  chapters:[{ pages:[
    "Hace mucho tiempo, en un pueblo mexica, vivían dos niños que eran los mejores amigos. Ella se llamaba Xóchitl, que quiere decir flor. Él se llamaba Huitzilin, que quiere decir colibrí.",
    "Todas las tardes subían juntos a una montaña. Allá arriba le llevaban flores al dios del sol, Tonatiuh, que los miraba con cariño. Se prometieron que siempre estarían juntos.",
    "Cuando crecieron, Huitzilin tuvo que irse muy lejos y ya no regresó. Xóchitl estaba muy triste. Subió a la montaña y le pidió a Tonatiuh que la volviera a reunir con su amigo.",
    "El sol le mandó un rayo dorado y Xóchitl se convirtió en una flor de pétalos naranjas, brillantes como el sol. Entonces llegó un colibrí, se posó en la flor, y la flor se abrió. ¡Era Huitzilin!",
    "Por eso, en el Día de Muertos, adornamos los altares con flores de cempasúchil. Su color y su aroma ayudan a las almas a encontrar el camino a casa, para estar otra vez con quienes las quieren."
  ], quiz:[
    { k:"literal", q:"¿En qué se convirtió Xóchitl?", o:["En una flor naranja","En un colibrí","En una montaña","En el sol"], a:0, ev:"Xóchitl se convirtió en una flor de pétalos naranjas" },
    { k:"infer", q:"¿Por qué ponemos cempasúchil en los altares?", o:["Para ayudar a las almas a encontrar el camino","Porque es la flor más barata","Para que lleguen colibríes","Porque no tiene olor"], a:0, ev:"Su color y su aroma ayudan a las almas a encontrar el camino a casa" },
    { k:"vocab", q:"¿Qué es un «colibrí»?", o:["Un pájaro muy pequeño","Una flor","Un dios","Una montaña"], a:0, ev:"Él se llamaba Huitzilin, que quiere decir colibrí." }
  ]}]},

{ id:"es-3-volcanes", lang:"es", grade:"3", genre:"fairy", icon:"🌋",
  title:"La leyenda de los volcanes (Popocatépetl e Iztaccíhuatl)", author:"Leyenda mexicana, versión propia", credit:"Versión propia de una leyenda mexicana (fuente de dominio público).",
  chapters:[{ pages:[
    "Hace muchos siglos, en el valle de México, vivía una princesa llamada Iztaccíhuatl. Era hija de un gran señor y todos la querían por su bondad. Iztaccíhuatl estaba enamorada de Popocatépetl, un joven guerrero valiente y noble que también la amaba con todo el corazón.",
    "Un día estalló una guerra y Popocatépetl tuvo que partir a pelear muy lejos. Antes de irse, le pidió al padre de la princesa permiso para casarse con ella. —Si regresas victorioso —le respondió el señor—, podrás casarte con mi hija. Popocatépetl prometió volver.",
    "Pasaron muchos meses. Un guerrero celoso regresó antes que los demás y mintió: dijo que Popocatépetl había muerto en la batalla. Al escuchar la noticia, Iztaccíhuatl se puso tan triste que cayó en un sueño profundo del que nunca despertó.",
    "Cuando Popocatépetl volvió victorioso, encontró a su amada dormida para siempre. Con mucho cuidado, la cargó hasta lo alto de una montaña y encendió una antorcha para cuidar su sueño. Se arrodilló a su lado y nunca se separó de ella. Con el tiempo, la nieve los cubrió y los dos se convirtieron en volcanes. Hoy todavía puedes verlos: la Mujer Dormida, y a su lado Popocatépetl, que a veces echa humo como su antorcha."
  ], quiz:[
    { k:"literal", q:"¿Qué hizo Popocatépetl con su antorcha?", o:["La encendió para cuidar el sueño de la princesa","La usó en la guerra","La regaló al padre","La apagó en la nieve"], a:0, ev:"encendió una antorcha para cuidar su sueño" },
    { k:"infer", q:"¿Por qué Iztaccíhuatl cayó en un sueño profundo?", o:["Creyó que Popocatépetl había muerto","Estaba muy cansada","Su padre se lo pidió","Hacía mucho frío"], a:0, ev:"Al escuchar la noticia, Iztaccíhuatl se puso tan triste" },
    { k:"vocab", q:"¿Qué quiere decir «victorioso»?", o:["Que ganó","Que perdió","Que tiene miedo","Que está dormido"], a:0, ev:"—Si regresas victorioso —le respondió el señor—" }
  ]}]},

{ id:"es-3-flautista", lang:"es", grade:"3", genre:"fairy", icon:"🪈",
  title:"El flautista de Hamelín", author:"Leyenda alemana, versión propia en prosa", credit:"Versión propia en prosa de una leyenda alemana (fuente de dominio público).",
  chapters:[{ pages:[
    "Hamelín era un pueblo junto a un río, con casas de techos rojos y calles de piedra. Pero un año llegaron miles y miles de ratas. Se comían el queso, mordían los zapatos y hasta dormían en las cunas de los bebés. La gente ya no sabía qué hacer.",
    "Un día apareció un hombre muy delgado con un traje de muchos colores y una flauta. —Yo puedo librarlos de las ratas —le dijo al alcalde—, si me pagan mil monedas de oro. —¡Mil monedas! —contestó el alcalde—. Si lo logras, te las daremos.",
    "El flautista empezó a tocar una melodía extraña. De todas las casas salieron las ratas, grandes y pequeñas, y lo siguieron bailando por las calles. El flautista caminó hasta el río, y todas las ratas se metieron al agua y se las llevó la corriente.",
    "Pero el alcalde era tacaño. —Mil monedas es demasiado —dijo—. Toma solo cincuenta. El flautista no dijo nada. Salió a la calle y tocó otra melodía, alegre y mágica. Esta vez lo siguieron los niños, que salieron riendo y bailando detrás de él. El pueblo entero lloró hasta que el alcalde pagó lo prometido, y entonces el flautista devolvió a los niños. Desde ese día, en Hamelín siempre se cumplen las promesas."
  ], quiz:[
    { k:"literal", q:"¿Qué le pidió el flautista al alcalde?", o:["Mil monedas de oro","Una casa nueva","Un queso grande","Una flauta"], a:0, ev:"si me pagan mil monedas de oro" },
    { k:"infer", q:"¿Por qué el flautista se llevó a los niños?", o:["Porque el alcalde no cumplió su promesa","Porque quería jugar","Porque las ratas regresaron","Porque los niños se lo pidieron"], a:0, ev:"Pero el alcalde era tacaño." },
    { k:"vocab", q:"¿Qué quiere decir «tacaño»?", o:["Que no quiere gastar ni compartir","Que es muy generoso","Que es muy alto","Que toca música"], a:0, ev:"Pero el alcalde era tacaño." }
  ]}]},

{ id:"es-4-raton-perez", lang:"es", grade:"4", genre:"fairy", icon:"🐭",
  title:"Ratón Pérez", author:"Luis Coloma (1894), versión propia", credit:"Versión propia de «Ratón Pérez» de Luis Coloma (1894), dominio público.",
  chapters:[{ pages:[
    "Hace mucho tiempo, un niño rey llamado Bubi tenía apenas ocho años. Una noche, mientras cenaba, se le movió un diente de leche, y luego se le cayó. Su mamá, la reina, le dijo: —Pon el diente debajo de tu almohada. Esta noche vendrá a buscarlo el Ratón Pérez.",
    "Bubi se acostó, pero se quedó despierto con los ojos muy abiertos. A medianoche oyó un ruidito, y de entre las cortinas salió un ratoncito con sombrero de paja, lentes de oro y una pequeña mochila roja. Era el famoso Ratón Pérez, que recoge los dientes de todos los niños del mundo.",
    "—Majestad —dijo el ratón con una reverencia—, ¿le gustaría acompañarme esta noche? Tocó la nariz de Bubi con la punta de su cola, y el niño se encogió hasta quedar del tamaño de un ratón. Juntos salieron por un agujero de la pared y recorrieron túneles secretos hasta llegar a la casa de un niño muy pobre que vivía en un desván frío.",
    "Bubi vio que aquel niño dormía sin cobijas y que su mamá no tenía qué darle de cenar. El Ratón Pérez cambió el diente del niño por una moneda, con mucho cuidado para no despertarlo. Al día siguiente, Bubi despertó en su cama de rey, pero ya no era el mismo. Le pidió a su mamá que ayudaran a todos los niños pobres del reino, y desde entonces gobernó con un corazón generoso."
  ], quiz:[
    { k:"literal", q:"¿Qué llevaba puesto el Ratón Pérez?", o:["Sombrero de paja y lentes de oro","Una corona de rey","Un traje de colores","Una capa negra"], a:0, ev:"un ratoncito con sombrero de paja, lentes de oro y una pequeña mochila roja" },
    { k:"infer", q:"¿Qué aprendió Bubi en su viaje?", o:["A pensar en los niños que no tienen nada","Que los ratones dan miedo","A no perder sus dientes","Que el castillo es aburrido"], a:0, ev:"Le pidió a su mamá que ayudaran a todos los niños pobres del reino" },
    { k:"vocab", q:"¿Qué quiere decir «generoso»?", o:["Que comparte con los demás","Que guarda todo para sí","Que está muy cansado","Que es muy pequeño"], a:0, ev:"gobernó con un corazón generoso" }
  ]}]},

{ id:"es-4-grito-dolores", lang:"es", grade:"4", genre:"seasons", season:"independencia", icon:"🔔",
  title:"El Grito de Dolores (16 de septiembre, no ficción)", author:"Original", credit:"Texto original de no ficción escrito para Shellfie.",
  chapters:[{ pages:[
    "Hace más de doscientos años, México no era un país independiente. Se llamaba Nueva España y lo gobernaba el rey de España, que vivía al otro lado del océano. Muchas personas que vivían aquí, sobre todo los indígenas y los mestizos, eran tratadas con injusticia y pagaban impuestos muy altos.",
    "En el pueblo de Dolores, en Guanajuato, vivía un sacerdote llamado Miguel Hidalgo y Costilla. Hidalgo enseñaba a la gente a cultivar uvas, a criar abejas y a hacer cerámica. Junto con otros, como Ignacio Allende y Josefa Ortiz de Domínguez, planeaba en secreto un movimiento para cambiar las cosas.",
    "Cuando descubrieron el plan, Hidalgo decidió no esperar más. En la madrugada del 16 de septiembre de 1810, hizo sonar la campana de la iglesia de Dolores. La gente llegó corriendo, y Hidalgo la llamó a luchar por la libertad. Ese llamado se conoce como el Grito de Dolores, y fue el comienzo de la Guerra de Independencia.",
    "La lucha duró once años. Por fin, en 1821, México se convirtió en un país independiente. Hoy, cada 15 de septiembre por la noche, el presidente toca una campana y repite el grito desde el Palacio Nacional. Las familias cenan pozole, decoran con los colores verde, blanco y rojo, y gritan juntas: ¡Viva México!"
  ], quiz:[
    { k:"literal", q:"¿Qué hizo sonar Hidalgo el 16 de septiembre de 1810?", o:["La campana de la iglesia","Un tambor","Una trompeta","Un silbato"], a:0, ev:"hizo sonar la campana de la iglesia de Dolores" },
    { k:"infer", q:"¿Por qué Hidalgo decidió no esperar más?", o:["Porque habían descubierto el plan","Porque era su cumpleaños","Porque el rey se lo pidió","Porque ya había terminado la guerra"], a:0, ev:"Cuando descubrieron el plan, Hidalgo decidió no esperar más." },
    { k:"vocab", q:"¿Qué quiere decir «independiente»?", o:["Que se gobierna solo","Que es muy antiguo","Que es muy pequeño","Que vive lejos"], a:0, ev:"México se convirtió en un país independiente" }
  ]}]},

{ id:"es-5-regalo-reyes", lang:"es", grade:"5", genre:"seasons", season:"reyes", icon:"🎁",
  title:"El regalo de los Reyes Magos", author:"O. Henry (1905), traducción y versión propia", credit:"Traducción y versión abreviada propia de «The Gift of the Magi» de O. Henry (1905), dominio público.",
  chapters:[{ pages:[
    "Un dólar con ochenta y siete centavos. Eso era todo el dinero que tenía Della, y al día siguiente era Navidad. Lo había ahorrado centavo por centavo, regateando con el tendero y el carnicero hasta que se le ponían rojas las mejillas. Della y su esposo, Jim, vivían en un departamento pequeño y sencillo, pero tenían dos tesoros de los que estaban muy orgullosos: el reloj de oro de Jim, que había sido de su padre y de su abuelo, y el cabello de Della, que le caía hasta las rodillas como una cascada castaña y brillante.",
    "Della miraba por la ventana a un gato gris que caminaba sobre una barda gris. Quería regalarle a Jim algo especial, algo digno de él. De pronto se apartó de la ventana, se puso su viejo abrigo café y su sombrero, y corrió hasta una tienda con un letrero que decía: «Madame Sofronie. Artículos de cabello de todas clases». Veinte minutos después salió con veinte dólares, y su hermoso cabello ya no estaba.",
    "Recorrió todas las tiendas hasta que lo encontró: una cadena de platino, sencilla y elegante, para el reloj de Jim. A las siete en punto se abrió la puerta. Jim entró y se quedó mirando el cabello corto de Della con una expresión extraña. —No me mires así —le suplicó ella—. El pelo me crece muy rápido. Lo vendí para comprarte un regalo.",
    "Jim sacó un paquete de su abrigo. Adentro había unas peinetas de carey con orillas de piedras brillantes, las mismas que Della había admirado durante meses en un aparador. Ahora no tenía cabello largo para usarlas. Entonces ella le mostró la cadena. Jim sonrió con ternura. —Della —le dijo—, vendí el reloj para comprarte las peinetas.",
    "Los Reyes Magos fueron los sabios que llevaron regalos al niño recién nacido, y así inventaron la costumbre de regalar. Della y Jim habían sacrificado, sin pensarlo, los mayores tesoros de su casa el uno por el otro. Y, sin embargo, nos dice el autor, de todos los que hacen regalos, ellos fueron los más sabios. Ellos son los verdaderos Reyes Magos."
  ], quiz:[
    { k:"literal", q:"¿Qué vendió Della para comprar el regalo de Jim?", o:["Su cabello","Su abrigo","Sus peinetas","Su reloj"], a:0, ev:"Veinte minutos después salió con veinte dólares, y su hermoso cabello ya no estaba." },
    { k:"infer", q:"¿Por qué el autor dice que Della y Jim fueron los más sabios?", o:["Dieron lo que más querían el uno por el otro","Encontraron los mejores precios","Compraron regalos muy caros","Guardaron bien sus tesoros"], a:0, ev:"Della y Jim habían sacrificado, sin pensarlo, los mayores tesoros de su casa el uno por el otro." },
    { k:"vocab", q:"¿Qué quiere decir «regatear»?", o:["Pedir un precio más bajo","Correr muy rápido","Pintar una barda","Cortar el cabello"], a:0, ev:"regateando con el tendero y el carnicero" }
  ]}]},

{ id:"es-5-principe-feliz", lang:"es", grade:"5", genre:"fairy", icon:"🕊️",
  title:"El príncipe feliz", author:"Oscar Wilde (1888), versión propia", credit:"Versión propia de «The Happy Prince» de Oscar Wilde (1888), dominio público.",
  chapters:[{ pages:[
    "En lo alto de una columna, sobre la ciudad, se alzaba la estatua del Príncipe Feliz. Estaba cubierta de finas hojas de oro, tenía dos zafiros azules por ojos y un gran rubí rojo brillaba en el puño de su espada. Todos lo admiraban. —Es tan hermoso como una veleta —decían los concejales.",
    "Una noche de otoño, una golondrina que viajaba hacia Egipto se detuvo a descansar a los pies de la estatua. De pronto le cayó una gota de agua. Luego otra. Miró hacia arriba y vio que el Príncipe Feliz estaba llorando. —Desde aquí arriba veo toda la tristeza de mi ciudad —le explicó—. Golondrina, ¿te quedarías una noche a ayudarme?",
    "El príncipe le pidió que llevara el rubí de su espada a una costurera pobre cuyo hijo tenía fiebre. A la noche siguiente, le pidió uno de sus ojos de zafiro para un joven escritor que no tenía con qué calentarse, y luego el otro para una niña que vendía cerillos. —Ahora estás ciego —dijo la golondrina—. Me quedaré contigo para siempre.",
    "Durante el invierno, la golondrina fue quitando las hojas de oro de la estatua, una por una, y las repartió entre los niños hambrientos de la ciudad. El príncipe se volvió gris y opaco, pero en las calles se oían risas. Con la nieve, la golondrina se fue debilitando. Le dio un beso al príncipe y cayó muerta a sus pies. En ese momento, algo se rompió dentro de la estatua: su corazón de plomo se partió en dos.",
    "Los concejales vieron la estatua gris y decidieron fundirla. Pero el corazón de plomo no se derretía en el horno, y lo tiraron a la basura junto a la golondrina. Ese día, un ángel buscó las dos cosas más valiosas de la ciudad. Sin dudar, llevó al cielo el corazón de plomo y el pajarito muerto, donde la golondrina cantará para siempre y el Príncipe Feliz será, por fin, verdaderamente feliz."
  ], quiz:[
    { k:"literal", q:"¿A quién le llevó la golondrina el rubí?", o:["A una costurera pobre","A una niña de los cerillos","A un concejal","A un escritor"], a:0, ev:"que llevara el rubí de su espada a una costurera pobre" },
    { k:"infer", q:"¿Por qué el ángel eligió el corazón y la golondrina?", o:["Porque dieron todo para ayudar a otros","Porque eran de oro","Porque eran los más bonitos","Porque nadie los quería"], a:0, ev:"Ese día, un ángel buscó las dos cosas más valiosas de la ciudad." },
    { k:"vocab", q:"¿Qué quiere decir «opaco»?", o:["Sin brillo","Muy caliente","Muy alegre","Transparente"], a:0, ev:"El príncipe se volvió gris y opaco" }
  ]}]}
];
