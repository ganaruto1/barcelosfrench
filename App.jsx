import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";

/* ================================================================
   FRENCH MASTER 2.0 — Aprenda francês do zero ao nível literário
   ----------------------------------------------------------------
   Mesma engine do German Master, adaptada ao francês:
   • Repetição espaçada real (SM-2 simplificado) por palavra
   • Palavras erradas voltam mais; dominadas "descansam"
   • Banco crescente: IA gera palavras NOVAS que entram no banco
   • Dificuldade adaptativa: streak alto → desafio de nível acima
   • Detecção de ponto fraco (categoria mais errada) → foco extra
   • Aba 📐 Grammaire: artigos & partitivo, pronomes COD/COI/y/en,
     passé composé & concordância, adjetivos, subjuntivo,
     detector de erro
   • Feedback com diff palavra a palavra + explicação gramatical
   • Dicas progressivas (letra → nº palavras → metade)
   • TTS (ouvir palavra/frase em francês)
   • Sessão com meta diária, aquecimento com palavras fracas,
     resumo de fim de sessão
   • Calendário de streak diário + badges/conquistas
   • Mapa de calor de pontos fortes/fracos + estimativa CEFR real
   • Faux amis FR-PT destacados (attendre ≠ atender!)
   • Visual: paleta Tricolor (azul-marinho/dourado/vermelho),
     serifada nos títulos, confete em canvas, shimmer na barra de XP,
     grain no fundo, prefers-reduced-motion respeitado, temas
     alternativos (Belle Époque / Violeta clássico)
   ================================================================ */

/* ---------------------- BANCO DE PALAVRAS ---------------------- */
const BASE_WORDS = [
  // ===================== Nível 0 — A1 (essencial) =====================
  { g: "être", t: "ser/estar", c: "V", l: 0 },
  { g: "avoir", t: "ter", c: "V", l: 0 },
  { g: "aller", t: "ir", c: "V", l: 0 },
  { g: "faire", t: "fazer", c: "V", l: 0 },
  { g: "venir", t: "vir", c: "V", l: 0 },
  { g: "manger", t: "comer", c: "V", l: 0 },
  { g: "boire", t: "beber", c: "V", l: 0 },
  { g: "vouloir", t: "querer", c: "V", l: 0 },
  { g: "pouvoir", t: "poder", c: "V", l: 0 },
  { g: "parler", t: "falar", c: "V", l: 0 },
  { g: "la maison", t: "a casa", c: "S", l: 0 },
  { g: "la table", t: "a mesa", c: "S", l: 0 },
  { g: "la porte", t: "a porta", c: "S", l: 0 },
  { g: "le livre", t: "o livro", c: "S", l: 0 },
  { g: "l'eau", t: "a água (f.)", c: "S", l: 0 },
  { g: "le jour", t: "o dia", c: "S", l: 0 },
  { g: "la nuit", t: "a noite", c: "S", l: 0 },
  { g: "le nom", t: "o nome", c: "S", l: 0 },
  { g: "l'ami", t: "o amigo (m.)", c: "S", l: 0 },
  { g: "le café", t: "o café", c: "S", l: 0 },
  { g: "bon", t: "bom", c: "A", l: 0 },
  { g: "grand", t: "grande", c: "A", l: 0 },
  { g: "petit", t: "pequeno", c: "A", l: 0 },
  { g: "beau", t: "bonito", c: "A", l: 0 },
  { g: "content", t: "contente", c: "A", l: 0 },
  { g: "et", t: "e", c: "K", l: 0 },
  { g: "ou", t: "ou", c: "K", l: 0 },
  { g: "aussi", t: "também", c: "K", l: 0 },
  { g: "ici", t: "aqui", c: "K", l: 0 },
  { g: "oui", t: "sim", c: "K", l: 0 },
  { g: "non", t: "não", c: "K", l: 0 },
  { g: "merci", t: "obrigado(a)", c: "K", l: 0 },
  { g: "bonjour", t: "bom dia/olá", c: "K", l: 0 },
  { g: "aujourd'hui", t: "hoje", c: "K", l: 0 },
  { g: "demain", t: "amanhã", c: "K", l: 0 },
  // ===================== Nível 1 — A1 =====================
  { g: "dormir", t: "dormir", c: "V", l: 1 },
  { g: "jouer", t: "brincar/jogar", c: "V", l: 1 },
  { g: "travailler", t: "trabalhar", c: "V", l: 1 },
  { g: "apprendre", t: "aprender", c: "V", l: 1 },
  { g: "lire", t: "ler", c: "V", l: 1 },
  { g: "écrire", t: "escrever", c: "V", l: 1 },
  { g: "acheter", t: "comprar", c: "V", l: 1 },
  { g: "habiter", t: "morar", c: "V", l: 1 },
  { g: "regarder", t: "olhar/assistir", c: "V", l: 1 },
  { g: "écouter", t: "escutar", c: "V", l: 1 },
  { g: "aimer", t: "amar/gostar", c: "V", l: 1 },
  { g: "chanter", t: "cantar", c: "V", l: 1 },
  { g: "danser", t: "dançar", c: "V", l: 1 },
  { g: "le chien", t: "o cachorro", c: "S", l: 1 },
  { g: "le chat", t: "o gato", c: "S", l: 1 },
  { g: "la voiture", t: "o carro", c: "S", l: 1 },
  { g: "le lait", t: "o leite", c: "S", l: 1 },
  { g: "le pain", t: "o pão", c: "S", l: 1 },
  { g: "l'homme", t: "o homem (m.)", c: "S", l: 1 },
  { g: "la femme", t: "a mulher", c: "S", l: 1 },
  { g: "l'enfant", t: "a criança (m./f.)", c: "S", l: 1 },
  { g: "la ville", t: "a cidade", c: "S", l: 1 },
  { g: "le pays", t: "o país", c: "S", l: 1 },
  { g: "la famille", t: "a família", c: "S", l: 1 },
  { g: "l'argent", t: "o dinheiro (m.)", c: "S", l: 1 },
  { g: "le temps", t: "o tempo", c: "S", l: 1 },
  { g: "mauvais", t: "ruim", c: "A", l: 1 },
  { g: "nouveau", t: "novo", c: "A", l: 1 },
  { g: "vieux", t: "velho", c: "A", l: 1 },
  { g: "rapide", t: "rápido", c: "A", l: 1 },
  { g: "lent", t: "lento", c: "A", l: 1 },
  { g: "joli", t: "bonito/gracioso", c: "A", l: 1 },
  { g: "facile", t: "fácil", c: "A", l: 1 },
  { g: "long", t: "longo/comprido", c: "A", l: 1 },
  { g: "mais", t: "mas", c: "K", l: 1 },
  { g: "car", t: "pois", c: "K", l: 1 },
  { g: "donc", t: "então/portanto", c: "K", l: 1 },
  { g: "avec", t: "com", c: "K", l: 1 },
  { g: "sans", t: "sem", c: "K", l: 1 },
  { g: "très", t: "muito", c: "K", l: 1 },
  { g: "beaucoup", t: "muito(s)", c: "K", l: 1 },
  // ===================== Nível 2 — A2 =====================
  { g: "avoir besoin de", t: "precisar de", c: "V", l: 2 },
  { g: "trouver", t: "achar/encontrar", c: "V", l: 2 },
  { g: "aider", t: "ajudar", c: "V", l: 2 },
  { g: "entendre", t: "ouvir (⚠️ não é 'entender')", c: "V", l: 2 },
  { g: "voir", t: "ver", c: "V", l: 2 },
  { g: "connaître", t: "conhecer", c: "V", l: 2 },
  { g: "savoir", t: "saber", c: "V", l: 2 },
  { g: "comprendre", t: "entender", c: "V", l: 2 },
  { g: "ouvrir", t: "abrir", c: "V", l: 2 },
  { g: "fermer", t: "fechar", c: "V", l: 2 },
  { g: "penser", t: "pensar", c: "V", l: 2 },
  { g: "croire", t: "crer/acreditar", c: "V", l: 2 },
  { g: "montrer", t: "mostrar", c: "V", l: 2 },
  { g: "porter", t: "carregar/usar (roupa)", c: "V", l: 2 },
  { g: "la rue", t: "a rua", c: "S", l: 2 },
  { g: "le jardin", t: "o jardim", c: "S", l: 2 },
  { g: "la fenêtre", t: "a janela", c: "S", l: 2 },
  { g: "la cuisine", t: "a cozinha", c: "S", l: 2 },
  { g: "la chambre", t: "o quarto", c: "S", l: 2 },
  { g: "la chaise", t: "a cadeira", c: "S", l: 2 },
  { g: "l'école", t: "a escola (f.)", c: "S", l: 2 },
  { g: "l'enseignant", t: "o professor (m.)", c: "S", l: 2 },
  { g: "le travail", t: "o trabalho", c: "S", l: 2 },
  { g: "le repas", t: "a refeição", c: "S", l: 2 },
  { g: "l'heure", t: "a hora (f.)", c: "S", l: 2 },
  { g: "la semaine", t: "a semana", c: "S", l: 2 },
  { g: "le mois", t: "o mês", c: "S", l: 2 },
  { g: "l'année", t: "o ano (f.)", c: "S", l: 2 },
  { g: "le magasin", t: "a loja", c: "S", l: 2 },
  { g: "chaud", t: "quente", c: "A", l: 2 },
  { g: "froid", t: "frio", c: "A", l: 2 },
  { g: "jeune", t: "jovem", c: "A", l: 2 },
  { g: "cher", t: "caro", c: "A", l: 2 },
  { g: "bon marché", t: "barato (invariável)", c: "A", l: 2 },
  { g: "gros", t: "gordo/grosso", c: "A", l: 2 },
  { g: "propre", t: "limpo / próprio", c: "A", l: 2 },
  { g: "sale", t: "sujo", c: "A", l: 2 },
  { g: "parce que", t: "porque", c: "K", l: 2 },
  { g: "que", t: "que", c: "K", l: 2 },
  { g: "quand", t: "quando", c: "K", l: 2 },
  { g: "comme", t: "como", c: "K", l: 2 },
  { g: "alors", t: "então", c: "K", l: 2 },
  { g: "toujours", t: "sempre", c: "K", l: 2 },
  { g: "souvent", t: "frequentemente", c: "K", l: 2 },
  { g: "jamais", t: "nunca", c: "K", l: 2 },
  // ===================== Nível 3 — A2 =====================
  { g: "apporter", t: "trazer", c: "V", l: 3 },
  { g: "chercher", t: "buscar/procurar", c: "V", l: 3 },
  { g: "donner", t: "dar", c: "V", l: 3 },
  { g: "prendre", t: "pegar/tomar", c: "V", l: 3 },
  { g: "conduire", t: "dirigir", c: "V", l: 3 },
  { g: "voler", t: "voar / roubar", c: "V", l: 3 },
  { g: "courir", t: "correr", c: "V", l: 3 },
  { g: "attendre", t: "esperar (⚠️ não é 'atender')", c: "V", l: 3 },
  { g: "commencer", t: "começar", c: "V", l: 3 },
  { g: "finir", t: "terminar", c: "V", l: 3 },
  { g: "payer", t: "pagar", c: "V", l: 3 },
  { g: "perdre", t: "perder", c: "V", l: 3 },
  { g: "gagner", t: "ganhar", c: "V", l: 3 },
  { g: "vendre", t: "vender", c: "V", l: 3 },
  { g: "répondre", t: "responder", c: "V", l: 3 },
  { g: "demander", t: "perguntar/pedir", c: "V", l: 3 },
  { g: "la gare", t: "a estação de trem", c: "S", l: 3 },
  { g: "le voyage", t: "a viagem", c: "S", l: 3 },
  { g: "la valise", t: "a mala", c: "S", l: 3 },
  { g: "le coin", t: "a esquina/o canto", c: "S", l: 3 },
  { g: "la pluie", t: "a chuva", c: "S", l: 3 },
  { g: "le soleil", t: "o sol", c: "S", l: 3 },
  { g: "le vent", t: "o vento", c: "S", l: 3 },
  { g: "le ciel", t: "o céu", c: "S", l: 3 },
  { g: "la route", t: "a estrada", c: "S", l: 3 },
  { g: "le billet", t: "o bilhete/a passagem", c: "S", l: 3 },
  { g: "la clé", t: "a chave", c: "S", l: 3 },
  { g: "le bruit", t: "o barulho", c: "S", l: 3 },
  { g: "l'idée", t: "a ideia (f.)", c: "S", l: 3 },
  { g: "le monde", t: "o mundo/as pessoas", c: "S", l: 3 },
  { g: "fatigué", t: "cansado", c: "A", l: 3 },
  { g: "affamé", t: "faminto", c: "A", l: 3 },
  { g: "triste", t: "triste", c: "A", l: 3 },
  { g: "heureux", t: "feliz", c: "A", l: 3 },
  { g: "tranquille", t: "calmo/tranquilo", c: "A", l: 3 },
  { g: "libre", t: "livre", c: "A", l: 3 },
  { g: "plein", t: "cheio", c: "A", l: 3 },
  { g: "vide", t: "vazio", c: "A", l: 3 },
  { g: "prêt", t: "pronto", c: "A", l: 3 },
  { g: "si", t: "se", c: "K", l: 3 },
  { g: "pendant", t: "durante", c: "K", l: 3 },
  { g: "avant", t: "antes", c: "K", l: 3 },
  { g: "après", t: "depois", c: "K", l: 3 },
  { g: "déjà", t: "já", c: "K", l: 3 },
  { g: "encore", t: "ainda/de novo", c: "K", l: 3 },
  // ===================== Nível 4 — B1 =====================
  { g: "se lever", t: "levantar-se", c: "V", l: 4 },
  { g: "se coucher", t: "deitar-se / ir dormir", c: "V", l: 4 },
  { g: "appeler", t: "chamar/telefonar", c: "V", l: 4 },
  { g: "faire les courses", t: "fazer compras", c: "V", l: 4 },
  { g: "ramener", t: "trazer de volta (alguém)", c: "V", l: 4 },
  { g: "revenir", t: "voltar", c: "V", l: 4 },
  { g: "s'en aller", t: "ir embora", c: "V", l: 4 },
  { g: "arrêter", t: "parar/cessar", c: "V", l: 4 },
  { g: "changer", t: "mudar", c: "V", l: 4 },
  { g: "choisir", t: "escolher", c: "V", l: 4 },
  { g: "essayer", t: "tentar/experimentar", c: "V", l: 4 },
  { g: "oublier", t: "esquecer", c: "V", l: 4 },
  { g: "se rappeler", t: "lembrar-se", c: "V", l: 4 },
  { g: "devenir", t: "tornar-se", c: "V", l: 4 },
  { g: "réussir", t: "conseguir/ser bem-sucedido", c: "V", l: 4 },
  { g: "le rendez-vous", t: "o compromisso marcado", c: "S", l: 4 },
  { g: "le choix", t: "a escolha", c: "S", l: 4 },
  { g: "l'entretien", t: "a entrevista / a manutenção (m.)", c: "S", l: 4 },
  { g: "l'endroit", t: "o lugar (m.)", c: "S", l: 4 },
  { g: "la santé", t: "a saúde", c: "S", l: 4 },
  { g: "le métier", t: "a profissão/o ofício", c: "S", l: 4 },
  { g: "les environs", t: "os arredores", c: "S", l: 4 },
  { g: "l'occasion", t: "a oportunidade (f.)", c: "S", l: 4 },
  { g: "le quartier", t: "o bairro", c: "S", l: 4 },
  { g: "l'entreprise", t: "a empresa (f.)", c: "S", l: 4 },
  { g: "le projet", t: "o projeto", c: "S", l: 4 },
  { g: "la réunion", t: "a reunião", c: "S", l: 4 },
  { g: "le souci", t: "a preocupação", c: "S", l: 4 },
  { g: "l'avenir", t: "o futuro (m.)", c: "S", l: 4 },
  { g: "gentil", t: "gentil/amável", c: "A", l: 4 },
  { g: "disponible", t: "disponível", c: "A", l: 4 },
  { g: "gratuit", t: "gratuito", c: "A", l: 4 },
  { g: "pareil", t: "igual/parecido", c: "A", l: 4 },
  { g: "difficile", t: "difícil", c: "A", l: 4 },
  { g: "récent", t: "recente", c: "A", l: 4 },
  { g: "célèbre", t: "famoso", c: "A", l: 4 },
  { g: "utile", t: "útil", c: "A", l: 4 },
  { g: "inquiet", t: "preocupado/inquieto", c: "A", l: 4 },
  { g: "pendant que", t: "enquanto", c: "K", l: 4 },
  { g: "après que", t: "depois que (+ indicativo)", c: "K", l: 4 },
  { g: "dès que", t: "assim que", c: "K", l: 4 },
  { g: "puisque", t: "já que/uma vez que", c: "K", l: 4 },
  { g: "pourtant", t: "no entanto (⚠️ não é 'portanto')", c: "K", l: 4 },
  { g: "peut-être", t: "talvez", c: "K", l: 4 },
  // ===================== Nível 5 — B1 =====================
  { g: "se réjouir de", t: "alegrar-se com", c: "V", l: 5 },
  { g: "se fâcher", t: "irritar-se/zangar-se", c: "V", l: 5 },
  { g: "se souvenir de", t: "lembrar-se de", c: "V", l: 5 },
  { g: "se dépêcher", t: "apressar-se", c: "V", l: 5 },
  { g: "se décider à", t: "decidir-se a", c: "V", l: 5 },
  { g: "s'apercevoir de", t: "dar-se conta de", c: "V", l: 5 },
  { g: "s'inquiéter", t: "preocupar-se", c: "V", l: 5 },
  { g: "se méfier de", t: "desconfiar de", c: "V", l: 5 },
  { g: "se rendre compte", t: "perceber/dar-se conta", c: "V", l: 5 },
  { g: "empêcher", t: "impedir", c: "V", l: 5 },
  { g: "permettre", t: "permitir", c: "V", l: 5 },
  { g: "proposer", t: "propor", c: "V", l: 5 },
  { g: "expliquer", t: "explicar", c: "V", l: 5 },
  { g: "obtenir", t: "obter", c: "V", l: 5 },
  { g: "le lien", t: "o vínculo/a ligação", c: "S", l: 5 },
  { g: "le ressenti", t: "a impressão/o sentimento", c: "S", l: 5 },
  { g: "l'habitude", t: "o hábito (f.)", c: "S", l: 5 },
  { g: "la démarche", t: "o procedimento/a diligência", c: "S", l: 5 },
  { g: "le but", t: "o objetivo", c: "S", l: 5 },
  { g: "l'avis", t: "a opinião (m.)", c: "S", l: 5 },
  { g: "la preuve", t: "a prova", c: "S", l: 5 },
  { g: "le moyen", t: "o meio/o recurso", c: "S", l: 5 },
  { g: "la réussite", t: "o sucesso/o êxito", c: "S", l: 5 },
  { g: "l'échec", t: "o fracasso (m.)", c: "S", l: 5 },
  { g: "le domaine", t: "o campo/a área", c: "S", l: 5 },
  { g: "la valeur", t: "o valor", c: "S", l: 5 },
  { g: "le sens", t: "o sentido", c: "S", l: 5 },
  { g: "convenable", t: "adequado", c: "A", l: 5 },
  { g: "fiable", t: "confiável", c: "A", l: 5 },
  { g: "convaincant", t: "convincente", c: "A", l: 5 },
  { g: "adapté", t: "apropriado", c: "A", l: 5 },
  { g: "évident", t: "evidente/óbvio", c: "A", l: 5 },
  { g: "efficace", t: "eficaz", c: "A", l: 5 },
  { g: "capable", t: "capaz", c: "A", l: 5 },
  { g: "surprenant", t: "surpreendente", c: "A", l: 5 },
  { g: "de sorte que", t: "de modo que", c: "K", l: 5 },
  { g: "quoique", t: "ainda que (+ subjuntivo)", c: "K", l: 5 },
  { g: "bien que", t: "embora (+ subjuntivo)", c: "K", l: 5 },
  { g: "afin que", t: "para que (+ subjuntivo)", c: "K", l: 5 },
  { g: "cependant", t: "contudo/entretanto", c: "K", l: 5 },
  { g: "d'ailleurs", t: "aliás/além disso", c: "K", l: 5 },
  // ===================== Nível 6 — B2 =====================
  { g: "douter de", t: "duvidar de", c: "V", l: 6 },
  { g: "prétendre", t: "afirmar (⚠️ não é 'pretender')", c: "V", l: 6 },
  { g: "supposer", t: "supor", c: "V", l: 6 },
  { g: "regretter", t: "lamentar", c: "V", l: 6 },
  { g: "renoncer à", t: "abrir mão de", c: "V", l: 6 },
  { g: "se plaindre de", t: "reclamar de", c: "V", l: 6 },
  { g: "permettre de", t: "possibilitar", c: "V", l: 6 },
  { g: "envisager", t: "cogitar/considerar", c: "V", l: 6 },
  { g: "constater", t: "constatar", c: "V", l: 6 },
  { g: "reprocher", t: "censurar/recriminar", c: "V", l: 6 },
  { g: "aboutir à", t: "resultar em", c: "V", l: 6 },
  { g: "entraîner", t: "acarretar / treinar", c: "V", l: 6 },
  { g: "le préalable", t: "o pré-requisito", c: "S", l: 6 },
  { g: "le désaccord", t: "a divergência/o desacordo", c: "S", l: 6 },
  { g: "les retombées", t: "os efeitos/desdobramentos", c: "S", l: 6 },
  { g: "le défi", t: "o desafio", c: "S", l: 6 },
  { g: "le préjugé", t: "o preconceito", c: "S", l: 6 },
  { g: "l'enjeu", t: "o que está em jogo (m.)", c: "S", l: 6 },
  { g: "la contrainte", t: "a restrição/o constrangimento", c: "S", l: 6 },
  { g: "le compromis", t: "o meio-termo/acordo", c: "S", l: 6 },
  { g: "la méfiance", t: "a desconfiança", c: "S", l: 6 },
  { g: "l'atout", t: "a vantagem/o trunfo (m.)", c: "S", l: 6 },
  { g: "la lacune", t: "a lacuna", c: "S", l: 6 },
  { g: "indépendant", t: "independente", c: "A", l: 6 },
  { g: "contradictoire", t: "contraditório", c: "A", l: 6 },
  { g: "soi-disant", t: "supostamente/pretenso", c: "A", l: 6 },
  { g: "décisif", t: "decisivo", c: "A", l: 6 },
  { g: "pertinent", t: "pertinente", c: "A", l: 6 },
  { g: "ambigu", t: "ambíguo", c: "A", l: 6 },
  { g: "flagrant", t: "flagrante/evidente", c: "A", l: 6 },
  { g: "durable", t: "duradouro/sustentável", c: "A", l: 6 },
  { g: "pourvu que", t: "desde que (+ subjuntivo)", c: "K", l: 6 },
  { g: "tandis que", t: "ao passo que/enquanto", c: "K", l: 6 },
  { g: "à moins que", t: "a menos que (+ subjuntivo)", c: "K", l: 6 },
  { g: "de crainte que", t: "com medo de que", c: "K", l: 6 },
  { g: "en revanche", t: "em compensação", c: "K", l: 6 },
  { g: "par conséquent", t: "por conseguinte", c: "K", l: 6 },
  // ===================== Nível 7 — B2 =====================
  { g: "se pencher sur", t: "analisar a fundo", c: "V", l: 7 },
  { g: "mettre en avant", t: "destacar", c: "V", l: 7 },
  { g: "tenir compte de", t: "levar em conta", c: "V", l: 7 },
  { g: "se consacrer à", t: "dedicar-se a", c: "V", l: 7 },
  { g: "disposer de", t: "dispor de", c: "V", l: 7 },
  { g: "se rapporter à", t: "referir-se a", c: "V", l: 7 },
  { g: "souligner", t: "sublinhar/ressaltar", c: "V", l: 7 },
  { g: "remettre en cause", t: "questionar/pôr em xeque", c: "V", l: 7 },
  { g: "faire face à", t: "enfrentar", c: "V", l: 7 },
  { g: "découler de", t: "decorrer de", c: "V", l: 7 },
  { g: "le constat", t: "a constatação", c: "S", l: 7 },
  { g: "le rapport", t: "a relação / o relatório", c: "S", l: 7 },
  { g: "la maîtrise", t: "o domínio/a superação", c: "S", l: 7 },
  { g: "la requête", t: "a demanda/solicitação", c: "S", l: 7 },
  { g: "le fondement", t: "o fundamento", c: "S", l: 7 },
  { g: "la portée", t: "o alcance", c: "S", l: 7 },
  { g: "le cadre", t: "o âmbito/o quadro", c: "S", l: 7 },
  { g: "la tendance", t: "a tendência", c: "S", l: 7 },
  { g: "l'écart", t: "a diferença/o afastamento (m.)", c: "S", l: 7 },
  { g: "incontournable", t: "inevitável/imperdível", c: "A", l: 7 },
  { g: "grave", t: "grave", c: "A", l: 7 },
  { g: "déterminant", t: "determinante", c: "A", l: 7 },
  { g: "cohérent", t: "coerente/compreensível", c: "A", l: 7 },
  { g: "significatif", t: "significativo", c: "A", l: 7 },
  { g: "sous-jacent", t: "subjacente", c: "A", l: 7 },
  { g: "notable", t: "notável", c: "A", l: 7 },
  { g: "alors que", t: "ao passo que/quando", c: "K", l: 7 },
  { g: "d'autant plus que", t: "sobretudo porque", c: "K", l: 7 },
  { g: "de même que", t: "assim como", c: "K", l: 7 },
  { g: "faute de quoi", t: "sob pena de/senão", c: "K", l: 7 },
  { g: "en dépit de", t: "apesar de", c: "K", l: 7 },
  { g: "au fur et à mesure", t: "à medida que", c: "K", l: 7 },
  // ===================== Nível 8 — C1 =====================
  { g: "assurer", t: "garantir/assegurar", c: "V", l: 8 },
  { g: "nuire à", t: "prejudicar", c: "V", l: 8 },
  { g: "mettre en lumière", t: "ilustrar/evidenciar", c: "V", l: 8 },
  { g: "engendrer", t: "gerar/produzir", c: "V", l: 8 },
  { g: "être soumis à", t: "estar sujeito a", c: "V", l: 8 },
  { g: "préconiser", t: "preconizar/recomendar", c: "V", l: 8 },
  { g: "conférer", t: "conferir/outorgar", c: "V", l: 8 },
  { g: "s'avérer", t: "revelar-se/mostrar-se", c: "V", l: 8 },
  { g: "la donnée", t: "o dado/a circunstância", c: "S", l: 8 },
  { g: "le cadre réglementaire", t: "o conjunto de normas", c: "S", l: 8 },
  { g: "l'exigence", t: "a exigência (f.)", c: "S", l: 8 },
  { g: "l'ampleur", t: "a amplitude/a dimensão (f.)", c: "S", l: 8 },
  { g: "le clivage", t: "a clivagem/a cisão", c: "S", l: 8 },
  { g: "l'aboutissement", t: "a culminação/o resultado (m.)", c: "S", l: 8 },
  { g: "la mise en œuvre", t: "a implementação", c: "S", l: 8 },
  { g: "indispensable", t: "indispensável", c: "A", l: 8 },
  { g: "précurseur", t: "pioneiro/norteador", c: "A", l: 8 },
  { g: "révélateur", t: "esclarecedor/revelador", c: "A", l: 8 },
  { g: "prépondérant", t: "preponderante", c: "A", l: 8 },
  { g: "délibéré", t: "deliberado/intencional", c: "A", l: 8 },
  { g: "inhérent", t: "inerente", c: "A", l: 8 },
  { g: "dès lors", t: "portanto/desde então", c: "K", l: 8 },
  { g: "néanmoins", t: "não obstante", c: "K", l: 8 },
  { g: "or", t: "ora (introduz oposição)", c: "K", l: 8 },
  { g: "à l'instar de", t: "à semelhança de", c: "K", l: 8 },
  { g: "sous réserve de", t: "sob reserva de", c: "K", l: 8 },
  // ===================== Nível 9 — C1 =====================
  { g: "concéder", t: "admitir/conceder", c: "V", l: 9 },
  { g: "se profiler", t: "delinear-se", c: "V", l: 9 },
  { g: "devancer", t: "antecipar", c: "V", l: 9 },
  { g: "ressortir", t: "vir à tona/sobressair", c: "V", l: 9 },
  { g: "entériner", t: "ratificar/homologar", c: "V", l: 9 },
  { g: "pallier", t: "remediar/atenuar", c: "V", l: 9 },
  { g: "le mobile", t: "o motivo profundo", c: "S", l: 9 },
  { g: "l'enchevêtrement", t: "o entrelaçamento (m.)", c: "S", l: 9 },
  { g: "la mouvance", t: "a corrente/a esfera de influência", c: "S", l: 9 },
  { g: "le soubassement", t: "o alicerce/a base profunda", c: "S", l: 9 },
  { g: "la nuance", t: "a nuance/o matiz", c: "S", l: 9 },
  { g: "irréfutable", t: "irrefutável", c: "A", l: 9 },
  { g: "multiforme", t: "multifacetado", c: "A", l: 9 },
  { g: "irrévocable", t: "irrevogável", c: "A", l: 9 },
  { g: "prégnant", t: "marcante/persistente", c: "A", l: 9 },
  { g: "ténu", t: "tênue", c: "A", l: 9 },
  { g: "quand bien même", t: "ainda que (+ condicional)", c: "K", l: 9 },
  { g: "toutefois", t: "todavia", c: "K", l: 9 },
  { g: "nonobstant", t: "não obstante (formal)", c: "K", l: 9 },
  { g: "partant", t: "por conseguinte (literário)", c: "K", l: 9 },
  // ===================== Nível 10 — C2 literário =====================
  { g: "s'en remettre à", t: "deixar a critério de", c: "V", l: 10 },
  { g: "advenir", t: "suceder/acontecer (literário)", c: "V", l: 10 },
  { g: "s'emparer de", t: "apoderar-se de", c: "V", l: 10 },
  { g: "incomber à", t: "caber por direito a", c: "V", l: 10 },
  { g: "susciter", t: "suscitar/provocar", c: "V", l: 10 },
  { g: "se dérober", t: "esquivar-se/furtar-se", c: "V", l: 10 },
  { g: "la teneur", t: "o teor/a natureza", c: "S", l: 10 },
  { g: "l'allégorie", t: "a alegoria/o símbolo (f.)", c: "S", l: 10 },
  { g: "la carence", t: "a insuficiência/carência", c: "S", l: 10 },
  { g: "l'accablement", t: "a angústia opressiva (m.)", c: "S", l: 10 },
  { g: "la mansuétude", t: "a clemência/a benevolência", c: "S", l: 10 },
  { g: "l'écueil", t: "o obstáculo/o escolho (m.)", c: "S", l: 10 },
  { g: "insondable", t: "insondável", c: "A", l: 10 },
  { g: "sublime", t: "sublime", c: "A", l: 10 },
  { g: "funeste", t: "fatídico/funesto", c: "A", l: 10 },
  { g: "inéluctable", t: "inelutável/inevitável", c: "A", l: 10 },
  { g: "ineffable", t: "inefável/indizível", c: "A", l: 10 },
  { g: "impérieux", t: "imperioso/premente", c: "A", l: 10 },
  { g: "poignant", t: "pungente/comovente", c: "A", l: 10 },
];

/* ---------------------- FAUX AMIS FR-PT ---------------------- */
const FALSE_FRIENDS = [
  { g: "attendre", wrong: "atender", right: "esperar", l: 3 },
  { g: "entendre", wrong: "entender", right: "ouvir", l: 2 },
  { g: "comprendre", wrong: "compreender só", right: "entender/incluir", l: 2 },
  { g: "pourtant", wrong: "portanto", right: "no entanto", l: 4 },
  { g: "subir", wrong: "subir", right: "sofrer/suportar", l: 5 },
  { g: "salir", wrong: "sair", right: "sujar", l: 5 },
  { g: "pousser", wrong: "puxar", right: "empurrar", l: 3 },
  { g: "tirer", wrong: "tirar (remover)", right: "puxar/atirar", l: 3 },
  { g: "le bâton", wrong: "batom", right: "o bastão (batom = rouge à lèvres)", l: 4 },
  { g: "le costume", wrong: "fantasia", right: "o terno (fantasia = déguisement)", l: 4 },
  { g: "prétendre", wrong: "pretender", right: "afirmar/alegar", l: 6 },
  { g: "la légume", wrong: "legume/verdura", right: "cuidado: 'le légume' é masc.! (verdura)", l: 3 },
  { g: "le tour", wrong: "tour/passeio só", right: "a volta/o giro (la tour = a torre)", l: 4 },
  { g: "quitter", wrong: "quitar", right: "deixar/abandonar (um lugar)", l: 4 },
  { g: "rester", wrong: "restar só", right: "ficar/permanecer", l: 2 },
  { g: "large", wrong: "largo (comprido)", right: "largo (de largura); comprido = long", l: 3 },
  { g: "la classe", wrong: "classe social só", right: "a turma/a sala de aula", l: 2 },
  { g: "assister à", wrong: "assistir (ajudar)", right: "comparecer/presenciar", l: 5 },
  { g: "le succès", wrong: "sucesso (evento)", right: "o êxito/o sucesso", l: 4 },
  { g: "envier", wrong: "enviar", right: "invejar (enviar = envoyer)", l: 5 },
  { g: "la déception", wrong: "decepção só", right: "a decepção (⚠️ não é 'engano')", l: 5 },
  { g: "actuellement", wrong: "atualmente = de fato", right: "atualmente/agora (não 'de fato')", l: 5 },
];

/* ---------------------- EXERCÍCIOS DE GRAMÁTICA ---------------------- */
const GRAMMAR_EXERCISES = [
  // ARTIGOS & PARTITIVO
  { kind: "art", l: 2, prompt: "Je bois ___ eau le matin.", options: ["du", "de la", "de l'", "des"], answer: "de l'", explain: "'eau' começa com vogal: o partitivo vira de l' (de l'eau)." },
  { kind: "art", l: 2, prompt: "Il mange ___ pain.", options: ["du", "de la", "de l'", "des"], answer: "du", explain: "Quantidade indefinida de algo incontável masculino: du (= de + le)." },
  { kind: "art", l: 2, prompt: "Elle achète ___ pommes.", options: ["du", "de la", "des", "de"], answer: "des", explain: "Plural indefinido: des pommes." },
  { kind: "art", l: 2, prompt: "Je mange ___ salade.", options: ["du", "de la", "de l'", "des"], answer: "de la", explain: "Partitivo feminino diante de consoante: de la salade." },
  { kind: "art", l: 3, prompt: "Je n'ai pas ___ argent.", options: ["du", "de l'", "d'", "des"], answer: "d'", explain: "Na negação, du/de la/de l'/des viram DE (aqui d' antes de vogal): pas d'argent." },
  { kind: "art", l: 4, prompt: "Il boit beaucoup ___ café.", options: ["du", "de", "des", "de le"], answer: "de", explain: "Após expressão de quantidade (beaucoup, peu, trop...), usa-se apenas DE: beaucoup de café." },
  { kind: "art", l: 3, prompt: "C'est ___ voiture de Paul. (posse)", options: ["la", "de la", "une", "des"], answer: "la", explain: "Aqui é artigo definido (a voiture específica de Paul): la voiture de Paul." },
  { kind: "art", l: 4, prompt: "Je vais ___ cinéma ce soir.", options: ["à le", "au", "à la", "aux"], answer: "au", explain: "à + le = AU. 'cinéma' é masculino: au cinéma." },
  { kind: "art", l: 4, prompt: "Elle parle ___ enfants.", options: ["à les", "aux", "à des", "des"], answer: "aux", explain: "à + les = AUX: parler aux enfants." },
  // PRONOMES COD / COI / Y / EN
  { kind: "pron", l: 3, prompt: "Tu vois Marie ? — Oui, je ___ vois.", options: ["la", "lui", "elle", "y"], answer: "la", explain: "'voir' pede objeto direto (COD). Marie → la." },
  { kind: "pron", l: 3, prompt: "Tu téléphones à Paul ? — Oui, je ___ téléphone.", options: ["le", "lui", "y", "en"], answer: "lui", explain: "'téléphoner À quelqu'un' pede objeto indireto (COI): à Paul → lui." },
  { kind: "pron", l: 4, prompt: "Tu vas à Lyon ? — Oui, j'___ vais.", options: ["y", "en", "le", "lui"], answer: "y", explain: "Y substitui lugar introduzido por à/en/dans: à Lyon → y." },
  { kind: "pron", l: 4, prompt: "Tu veux du fromage ? — Oui, j'___ veux.", options: ["en", "y", "le", "la"], answer: "en", explain: "EN substitui de + coisa (partitivo): du fromage → en." },
  { kind: "pron", l: 5, prompt: "Il pense à son avenir. → Il ___ pense.", options: ["y", "en", "le", "lui"], answer: "y", explain: "'penser à' + coisa → y. (Com pessoa seria: il pense à elle.)" },
  { kind: "pron", l: 4, prompt: "Tu connais mes amis ? — Oui, je ___ connais.", options: ["leur", "les", "en", "y"], answer: "les", explain: "'connaître' pede COD; plural → les." },
  { kind: "pron", l: 5, prompt: "Elle a besoin de conseils ? — Oui, elle ___ a besoin.", options: ["y", "en", "les", "leur"], answer: "en", explain: "'avoir besoin DE' → en substitui 'de + coisa'." },
  { kind: "pron", l: 5, prompt: "Donne le livre à ta sœur ! → Donne-___ !", options: ["le-lui", "lui-le", "le-la", "la-lui"], answer: "le-lui", explain: "No imperativo afirmativo: COD antes de COI, ligados por hífen: donne-le-lui." },
  // ORDEM DOS PRONOMES — reordenar
  { kind: "order", l: 4, words: ["je", "le", "lui", "ai", "donné"], answer: "je le lui ai donné", explain: "Ordem: COD (le/la/les) ANTES de lui/leur. Pronomes antes do auxiliar." },
  { kind: "order", l: 5, words: ["il", "ne", "me", "le", "dit", "pas"], answer: "il ne me le dit pas", explain: "Ordem: ne + me/te/nous/vous + le/la/les + verbo + pas." },
  { kind: "order", l: 5, words: ["nous", "y", "sommes", "allés"], answer: "nous y sommes allés", explain: "Y fica antes do auxiliar: nous y sommes allés." },
  { kind: "order", l: 6, words: ["elle", "ne", "leur", "en", "a", "pas", "parlé"], answer: "elle ne leur en a pas parlé", explain: "Ordem completa: ne + leur + en + auxiliar + pas + particípio. EN sempre por último entre os pronomes." },
  { kind: "order", l: 4, words: ["tu", "ne", "veux", "pas", "venir"], answer: "tu ne veux pas venir", explain: "Negação com verbo + infinitivo: ne + verbo conjugado + pas + infinitivo." },
  { kind: "order", l: 6, words: ["je", "ne", "lui", "en", "ai", "jamais", "parlé"], answer: "je ne lui en ai jamais parlé", explain: "lui + en antes do auxiliar; 'jamais' entre auxiliar e particípio." },
  // PASSÉ COMPOSÉ & CONCORDÂNCIA
  { kind: "pc", l: 4, prompt: "Elle est ___ à huit heures. (partir)", options: ["parti", "partie", "partis", "parties"], answer: "partie", explain: "Com auxiliar ÊTRE, o particípio concorda com o sujeito: elle → partie." },
  { kind: "pc", l: 4, prompt: "Ils ___ tombés dans la rue.", options: ["ont", "sont", "est", "a"], answer: "sont", explain: "'tomber' é verbo de movimento/estado: auxiliar ÊTRE. Ils sont tombés." },
  { kind: "pc", l: 5, prompt: "Les fleurs qu'il a ___ sont belles. (acheter)", options: ["acheté", "achetée", "achetés", "achetées"], answer: "achetées", explain: "Com AVOIR, concorda quando o COD vem ANTES do verbo: 'les fleurs que' → achetées." },
  { kind: "pc", l: 5, prompt: "Nous nous sommes ___ tôt. (lever)", options: ["levé", "levés", "levée", "lever"], answer: "levés", explain: "Verbo pronominal com être: concorda com o sujeito (nous, masc. plural) → levés." },
  { kind: "pc", l: 6, prompt: "Elle s'est ___ les mains. (laver)", options: ["lavée", "lavé", "lavés", "lavées"], answer: "lavé", explain: "Exceção: quando o COD ('les mains') vem DEPOIS do verbo, NÃO há concordância: elle s'est lavé les mains." },
  { kind: "pc", l: 4, prompt: "J'___ mangé une pomme.", options: ["suis", "ai", "es", "a"], answer: "ai", explain: "'manger' usa AVOIR: j'ai mangé. Sem concordância com COD posposto." },
  { kind: "pc", l: 5, prompt: "Marie et Anne sont ___ hier. (venir)", options: ["venu", "venue", "venus", "venues"], answer: "venues", explain: "être + sujeito fem. plural → venues." },
  // ADJETIVOS — posição e concordância
  { kind: "adj", l: 3, prompt: "un ___ ami (nouveau)", options: ["nouveau", "nouvel", "nouvelle", "nouveaux"], answer: "nouvel", explain: "Diante de vogal, nouveau vira NOUVEL: un nouvel ami. (Idem: bel, vieil.)" },
  { kind: "adj", l: 3, prompt: "une ___ maison (beau)", options: ["beau", "bel", "belle", "beaux"], answer: "belle", explain: "Feminino de beau: belle. Adjetivos curtos (beau, petit, grand...) vêm ANTES do substantivo." },
  { kind: "adj", l: 4, prompt: "de ___ idées (bon)", options: ["bons", "bonnes", "bonne", "bon"], answer: "bonnes", explain: "'idée' é feminino plural: bonnes. Note: des → DE antes de adjetivo anteposto (de bonnes idées)." },
  { kind: "adj", l: 6, prompt: "Como dizer 'um grande homem' (importante)?", options: ["un grand homme", "un homme grand", "un homme grande", "un grande homme"], answer: "un grand homme", explain: "Posição muda o sentido: GRAND antes = importante; depois = alto de estatura." },
  { kind: "adj", l: 4, prompt: "une femme ___ (sportif)", options: ["sportif", "sportive", "sportifs", "sportives"], answer: "sportive", explain: "Feminino de adjetivos em -if → -ive: sportive." },
  { kind: "adj", l: 5, prompt: "des gens ___ (heureux)", options: ["heureux", "heureuse", "heureuses", "heureu"], answer: "heureux", explain: "Adjetivos terminados em -x não mudam no masc. plural: heureux." },
  // SUBJUNTIVO
  { kind: "pron", l: 6, prompt: "Il faut que tu ___ maintenant. (partir)", options: ["pars", "partes", "partais", "partiras"], answer: "partes", explain: "'il faut que' exige SUBJUNTIVO: que tu partes." },
  { kind: "pron", l: 6, prompt: "Je veux que vous ___ la vérité. (dire)", options: ["dites", "disez", "disiez", "direz"], answer: "disiez", explain: "'vouloir que' + subjuntivo: que vous disiez." },
  { kind: "pron", l: 7, prompt: "Bien qu'il ___ fatigué, il travaille. (être)", options: ["est", "soit", "était", "sera"], answer: "soit", explain: "'bien que' sempre pede subjuntivo: qu'il soit." },
  // DETECTOR DE ERRO
  { kind: "error", l: 3, prompt: "Encontre o erro: « Je suis mangé une pomme. »", options: ["'suis' deveria ser 'ai'", "'mangé' errado", "'une' errado", "não há erro"], answer: "'suis' deveria ser 'ai'", explain: "'manger' usa auxiliar AVOIR: j'ai mangé une pomme. ÊTRE é só para movimento/estado e pronominais." },
  { kind: "error", l: 4, prompt: "Encontre o erro: « Elle est allé au marché. »", options: ["'est' errado", "'allé' → 'allée'", "'au' errado", "não há erro"], answer: "'allé' → 'allée'", explain: "Com être, o particípio concorda com o sujeito: elle est allée." },
  { kind: "error", l: 5, prompt: "Encontre o erro: « Je veux que tu viens demain. »", options: ["'veux' errado", "'viens' → 'viennes'", "'demain' errado", "não há erro"], answer: "'viens' → 'viennes'", explain: "'vouloir que' exige SUBJUNTIVO: que tu viennes." },
  { kind: "error", l: 6, prompt: "Encontre o erro: « Si j'aurais su, je serais venu. »", options: ["'aurais su' → 'avais su'", "'serais venu' errado", "'si' errado", "não há erro"], answer: "'aurais su' → 'avais su'", explain: "Depois de SI nunca se usa condicional: si + imparfait/plus-que-parfait → si j'avais su." },
  { kind: "error", l: 4, prompt: "Encontre o erro: « J'ai visité à Paris. »", options: ["'ai' errado", "'à' está sobrando", "'visité' errado", "não há erro"], answer: "'à' está sobrando", explain: "'visiter' é transitivo direto: on visite Paris (sem 'à'). J'ai visité Paris." },
  { kind: "error", l: 7, prompt: "Encontre o erro (norma culta): « Après qu'il soit parti, tout a changé. »", options: ["'soit' → 'est'", "'parti' errado", "'tout' errado", "não há erro"], answer: "'soit' → 'est'", explain: "'après que' pede INDICATIVO na norma culta: après qu'il est parti. (Subjuntivo é com 'avant que'.)" },
  { kind: "error", l: 8, prompt: "Encontre o erro: « Le rapport a été écrivé par le comité. »", options: ["'a été' errado", "'écrivé' → 'écrit'", "'par' errado", "não há erro"], answer: "'écrivé' → 'écrit'", explain: "Particípio irregular de 'écrire': écrit. Passiva: a été écrit." },
  { kind: "error", l: 5, prompt: "Encontre o erro: « Ils se sont parlés au téléphone. »", options: ["'se sont' errado", "'parlés' → 'parlé'", "'au' errado", "não há erro"], answer: "'parlés' → 'parlé'", explain: "'se parler' = parler À quelqu'un (COI): não há concordância. Ils se sont parlé." },
];

/* ---------------------- CONSTANTES ---------------------- */
const CEFR = { 0: "A1", 1: "A1", 2: "A2", 3: "A2", 4: "B1", 5: "B1", 6: "B2", 7: "B2", 8: "C1", 9: "C1", 10: "C2 literário" };
const TYPE_LABEL = { V: "Verbe", S: "Nom", A: "Adjectif", K: "Connecteur" };
const CURIOSITY_THEMES = ["Geografia", "Gastronomia", "História", "Animais", "Ciências", "Cultura"];

const THEMES = {
  tricolor: {
    name: "Tricolor (azul & dourado)",
    bg: "radial-gradient(circle at 20% 0%, #101a33 0%, #0a0f1f 40%, #050810 100%)",
    accent: "#e6c05c", accent2: "#e05555", text: "#eef2fa", sub: "#93a1c0",
    glass: "rgba(125,166,255,0.06)", border: "rgba(125,166,255,0.18)",
    orbA: "#1f3c8a", orbB: "#7a1f2a", orbC: "#24314f",
  },
  epoque: {
    name: "Belle Époque",
    bg: "radial-gradient(circle at 80% 0%, #1a1408 0%, #0d0a04 50%, #060503 100%)",
    accent: "#e6b64c", accent2: "#b8452f", text: "#f5efe0", sub: "#a89a78",
    glass: "rgba(230,182,76,0.06)", border: "rgba(230,182,76,0.18)",
    orbA: "#8a6d1f", orbB: "#6b2a1a", orbC: "#3d2f0e",
  },
  violet: {
    name: "Violeta clássico",
    bg: "radial-gradient(circle at 20% 10%, #1e1b4b 0%, #0f0c29 45%, #050510 100%)",
    accent: "#a78bfa", accent2: "#f472b6", text: "#f1f5f9", sub: "#94a3b8",
    glass: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)",
    orbA: "#7c3aed", orbB: "#db2777", orbC: "#2563eb",
  },
};

const BADGES = [
  { id: "first10", name: "Primeiros passos", emoji: "🌱", desc: "10 acertos no total", test: (s) => s.correct >= 10 },
  { id: "streak10", name: "Em chamas", emoji: "🔥", desc: "Sequência de 10 acertos", test: (s) => s.bestStreak >= 10 },
  { id: "streak25", name: "Incendiário", emoji: "☄️", desc: "Sequência de 25 acertos", test: (s) => s.bestStreak >= 25 },
  { id: "words50", name: "Colecionador", emoji: "📚", desc: "50 palavras praticadas", test: (s, srs) => Object.keys(srs).length >= 50 },
  { id: "words150", name: "Bibliotecário", emoji: "🏛️", desc: "150 palavras praticadas", test: (s, srs) => Object.keys(srs).length >= 150 },
  { id: "mastered20", name: "Memória de aço", emoji: "🧠", desc: "20 palavras dominadas", test: (s, srs) => Object.values(srs).filter((w) => w.box >= 4).length >= 20 },
  { id: "pronoms", name: "Mestre dos pronomes", emoji: "📐", desc: "15 acertos de gramática", test: (s) => (s.grammarCorrect || 0) >= 15 },
  { id: "level5", name: "Veterano", emoji: "🎖️", desc: "Alcançar nível 5", test: (s) => s.level >= 5 },
  { id: "level10", name: "Lenda", emoji: "👑", desc: "Alcançar nível 10", test: (s) => s.level >= 10 },
  { id: "days3", name: "Constância", emoji: "📅", desc: "3 dias diferentes praticando", test: (s) => (s.days || []).length >= 3 },
  { id: "days7", name: "Semana perfeita", emoji: "🗓️", desc: "7 dias diferentes praticando", test: (s) => (s.days || []).length >= 7 },
  { id: "c1", name: "Erudito", emoji: "🦉", desc: "Praticar no nível 8+", test: (s) => (s.maxDifficultyUsed || 0) >= 8 },
];

/* ---------------------- UTILITÁRIOS ---------------------- */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(str) {
  return (str || "").toLowerCase().trim()
    .replace(/œ/g, "oe").replace(/æ/g, "ae")
    .replace(/[’‘]/g, "'")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:«»"]/g, "").replace(/'/g, " ").replace(/\s+/g, " ").trim();
}

function similar(a, b) {
  const na = normalize(a), nb = normalize(b);
  if (na === nb) return true;
  if (na.length > 4 && (nb.includes(na) || na.includes(nb))) return true;
  const wa = na.split(" "), wb = nb.split(" ");
  const common = wa.filter((w) => wb.includes(w)).length;
  return common / Math.max(wa.length, wb.length) >= 0.7;
}

function wordDiff(user, target) {
  const uw = normalize(user).split(" ");
  const tw = (target || "").split(" ");
  return tw.map((w) => ({ word: w, ok: uw.includes(normalize(w)) }));
}

function articleColor(g, c, theme) {
  if (c === "S") {
    if (g.startsWith("le ")) return "#6ea8ff";
    if (g.startsWith("la ")) return "#ff7d9c";
    if (g.startsWith("l'") || g.startsWith("l’")) return "#4dd6a0";
    if (g.startsWith("les ")) return "#f0c96a";
  }
  if (c === "V") return theme.accent;
  if (c === "A") return "#c79bff";
  if (c === "K") return "#5fd4e8";
  return theme.text;
}

function robustJSONParse(raw) {
  if (!raw) return null;
  let text = raw.trim().replace(/```json/gi, "").replace(/```/g, "");
  try { return JSON.parse(text); } catch (e) {
    const objMatch = text.match(/\{[\s\S]*\}/);
    const arrMatch = text.match(/\[[\s\S]*\]/);
    const candidate = arrMatch && (!objMatch || arrMatch[0].length > objMatch[0].length) ? arrMatch[0] : objMatch ? objMatch[0] : null;
    if (candidate) { try { return JSON.parse(candidate); } catch (e2) { return null; } }
    return null;
  }
}

async function askClaude(prompt, maxTokens = 1000) {
  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "API request failed");
  }
  const data = await response.json();
  return data.text || "";
}

function speak(text) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const fr = voices.find((v) => v.lang && v.lang.startsWith("fr"));
    if (fr) u.voice = fr;
    window.speechSynthesis.speak(u);
  } catch (e) { /* TTS indisponível */ }
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ---------------------- SRS (SM-2 simplificado, Leitner) ----------------------
   box 0 = nova/errada (volta logo) ... box 5 = dominada (descansa dias)
   intervalos em ms por box */
const BOX_INTERVALS = [0, 5 * 60e3, 60 * 60e3, 8 * 3600e3, 2 * 86400e3, 6 * 86400e3];

function srsUpdate(entry, correct) {
  const e = entry || { box: 0, seen: 0, right: 0, wrong: 0, due: 0 };
  const seen = e.seen + 1;
  if (correct) {
    const rightStreak = (e.rightStreak || 0) + 1;
    const box = Math.min(5, e.box + 1);
    return { ...e, box, seen, right: e.right + 1, rightStreak, due: Date.now() + BOX_INTERVALS[box] };
  }
  return { ...e, box: 0, seen, wrong: e.wrong + 1, rightStreak: 0, due: Date.now() + 30e3 };
}

/* Seleciona palavras: prioridade 1) vencidas do SRS (fracas primeiro),
   2) nunca vistas no nível, 3) preenchimento aleatório do nível */
function pickWords(allWords, srs, diff, count, boostLevel = 0) {
  const d = Math.min(10, diff + boostLevel);
  let span = 1.5;
  let pool = allWords.filter((w) => w.l >= Math.max(0, d - span) && w.l <= Math.min(10, d + span));
  while (pool.length < count * 2 && span < 10) {
    span += 1;
    pool = allWords.filter((w) => w.l >= Math.max(0, d - span) && w.l <= Math.min(10, d + span));
  }
  const now = Date.now();
  const due = pool.filter((w) => srs[w.g] && srs[w.g].due <= now && srs[w.g].box < 5)
    .sort((a, b) => (srs[a.g].box - srs[b.g].box) || (srs[a.g].due - srs[b.g].due));
  const unseen = shuffle(pool.filter((w) => !srs[w.g]));
  const rest = shuffle(pool.filter((w) => srs[w.g] && !(srs[w.g].due <= now && srs[w.g].box < 5)));
  const result = [];
  for (const src of [due, unseen, rest]) {
    for (const w of src) {
      if (result.length >= count) break;
      if (!result.find((r) => r.g === w.g)) result.push(w);
    }
  }
  return result;
}

function weakestCategory(catStats) {
  let worst = null, worstRate = 1;
  for (const [cat, s] of Object.entries(catStats || {})) {
    const total = s.right + s.wrong;
    if (total >= 3) {
      const rate = s.right / total;
      if (rate < worstRate) { worstRate = rate; worst = cat; }
    }
  }
  return worstRate < 0.6 ? worst : null;
}

function estimateCEFR(srs, state) {
  const entries = Object.entries(srs);
  if (entries.length < 10) return null;
  const allWords = [...BASE_WORDS];
  let weighted = 0, weight = 0;
  for (const [g, e] of entries) {
    const w = allWords.find((x) => x.g === g);
    if (!w || e.seen < 2) continue;
    const acc = e.right / e.seen;
    weighted += w.l * acc * e.seen;
    weight += e.seen;
  }
  if (!weight) return null;
  const lvl = Math.round(weighted / weight);
  return CEFR[Math.max(0, Math.min(10, lvl))];
}

/* ---------------------- FALLBACKS (conteúdo de reserva) ---------------------- */
const FALLBACK_SENTENCES = {
  A1: [
    { fr: "Je bois de l'eau.", pt: "Eu bebo água.", tip: "Partitivo diante de vogal: de l'eau." },
    { fr: "Le chien est petit.", pt: "O cachorro é pequeno.", tip: "'chien' é masculino: le chien." },
    { fr: "Nous allons à la maison.", pt: "Nós vamos para casa.", tip: "'à la' = para a (feminino)." },
    { fr: "Le livre est bon.", pt: "O livro é bom.", tip: "Adjetivo depois do verbo être não muda de posição." },
    { fr: "Elle achète du pain.", pt: "Ela compra pão.", tip: "Partitivo masculino: du pain (quantidade indefinida)." },
    { fr: "J'aime le café.", pt: "Eu gosto de café.", tip: "'aimer' + artigo definido para gostos: le café." },
    { fr: "Il a un chat noir.", pt: "Ele tem um gato preto.", tip: "Adjetivo de cor vem DEPOIS: un chat noir." },
    { fr: "Nous parlons français.", pt: "Nós falamos francês.", tip: "Nomes de língua sem artigo após 'parler'." },
  ],
  A2: [
    { fr: "J'ai besoin de ton aide.", pt: "Eu preciso da sua ajuda.", tip: "avoir besoin DE — sempre com 'de'." },
    { fr: "Il fait mauvais aujourd'hui.", pt: "O tempo está ruim hoje.", tip: "Clima em francês: IL FAIT + adjetivo." },
    { fr: "Nous attendons à la gare.", pt: "Nós esperamos na estação.", tip: "⚠️ Faux ami: attendre = esperar (sem preposição antes do objeto)." },
    { fr: "Il ne comprend pas la question.", pt: "Ele não entende a pergunta.", tip: "Negação: NE antes do verbo, PAS depois." },
    { fr: "Elle travaille tous les jours.", pt: "Ela trabalha todos os dias.", tip: "'tous les jours' = todos os dias." },
    { fr: "Je pense que c'est vrai.", pt: "Eu acho que é verdade.", tip: "'penser que' + indicativo (afirmação)." },
    { fr: "Nous cherchons un magasin.", pt: "Nós procuramos uma loja.", tip: "'chercher' é direto: sem 'por' (chercher quelque chose)." },
  ],
  B1: [
    { fr: "J'ai appelé mon amie hier soir.", pt: "Eu liguei para minha amiga ontem à noite.", tip: "'appeler quelqu'un' — objeto direto, sem preposição." },
    { fr: "Après avoir mangé, nous sommes allés nous promener.", pt: "Depois de comer, fomos passear.", tip: "après + infinitivo passado (avoir/être + particípio)." },
    { fr: "Il est important que tu viennes à l'heure.", pt: "É importante que você chegue na hora.", tip: "'il est important que' + SUBJUNTIVO: viennes." },
    { fr: "Elle se réjouit de la bonne nouvelle.", pt: "Ela se alegra com a boa notícia.", tip: "se réjouir DE + substantivo." },
    { fr: "Je me suis levé tôt ce matin.", pt: "Eu me levantei cedo hoje de manhã.", tip: "Pronominal no passé composé: être + concordância (levé)." },
    { fr: "Bien qu'il pleuve, nous sortons.", pt: "Embora chova, nós saímos.", tip: "'bien que' + subjuntivo: qu'il pleuve." },
    { fr: "Je lui ai donné mon numéro.", pt: "Eu dei meu número a ele/ela.", tip: "COI 'lui' antes do auxiliar: je lui ai donné." },
  ],
  B2: [
    { fr: "Si j'avais plus de temps, je voyagerais plus souvent.", pt: "Se eu tivesse mais tempo, viajaria com mais frequência.", tip: "Si + imparfait → conditionnel (nunca 'si + conditionnel')." },
    { fr: "Il doute que la proposition soit acceptée.", pt: "Ele duvida que a proposta seja aceita.", tip: "douter que + subjuntivo: soit." },
    { fr: "Pourvu que rien n'arrive, on se voit demain.", pt: "Desde que nada aconteça, a gente se vê amanhã.", tip: "pourvu que + subjuntivo." },
    { fr: "Ce dont tu parles m'intéresse.", pt: "Aquilo de que você fala me interessa.", tip: "'ce dont' = aquilo de que (verbo com 'de': parler de)." },
    { fr: "Il vaudrait mieux que tu partes maintenant.", pt: "Seria melhor que você fosse embora agora.", tip: "'il vaudrait mieux que' + subjuntivo: que tu partes." },
  ],
  C1: [
    { fr: "Il semblerait que cette mesure ait des effets positifs.", pt: "Presume-se que a medida tenha efeitos positivos.", tip: "Conditionnel jornalístico + subjuntivo passado: ait." },
    { fr: "En dépit des critiques, il maintient sa position.", pt: "Apesar das críticas, ele mantém sua posição.", tip: "en dépit de = apesar de (registro formal)." },
    { fr: "La portée de cette décision avait d'abord été sous-estimée.", pt: "O alcance dessa decisão foi inicialmente subestimado.", tip: "Passiva no plus-que-parfait: avait été + particípio." },
    { fr: "Quoi qu'il en soit, la décision est prise.", pt: "Seja como for, a decisão está tomada.", tip: "'quoi qu'il en soit' = seja como for (subjuntivo cristalizado)." },
  ],
  "C2 literário": [
    { fr: "Eût-il connu la teneur de la lettre, il se fût abstenu d'y répondre.", pt: "Tivesse ele conhecido o teor da carta, teria se abstido de respondê-la.", tip: "Conditionnel passé 2e forme (= subjonctif plus-que-parfait), registro literário." },
    { fr: "C'était comme si le destin se fût emparé de lui.", pt: "Era como se o destino tivesse se apoderado dele.", tip: "'s'emparer de' + subjonctif plus-que-parfait literário." },
    { fr: "Nul n'eût osé prédire une issue aussi funeste.", pt: "Ninguém teria ousado prever um desfecho tão funesto.", tip: "'nul n'eût osé' = ninguém teria ousado (forma literária)." },
  ],
};

const FALLBACK_STORIES = {
  A1: { title: "Une journée au parc", text: "Anna va au parc. Elle voit un chien. Le chien est petit et marron. Anna joue avec le chien. Puis elle boit de l'eau et rentre à la maison." },
  A2: { title: "Le voyage à Paris", text: "Paul prend le train pour Paris. Il a une grande valise. À la gare, son amie l'attend. Ils sont très heureux et vont manger ensemble." },
  B1: { title: "Le rendez-vous oublié", text: "Hier, Léa avait un rendez-vous important, mais elle l'a oublié. Quand elle s'en est aperçue, elle a tout de suite appelé. Heureusement, ce n'était pas un problème de le reporter." },
  B2: { title: "Un choix difficile", text: "Marc devait prendre une décision qui changerait toute sa vie. Bien qu'il ait reçu beaucoup de conseils, il restait hésitant. Finalement, il a décidé de faire confiance à son propre ressenti." },
  C1: { title: "La mutation silencieuse", text: "La ville s'était profondément transformée en quelques années. On prétendait que cette évolution avait été inévitable. Néanmoins, beaucoup d'habitants se demandaient si la portée de ces changements avait vraiment été prise en compte." },
  "C2 literário": { title: "L'héritage du silence", text: "Dans cette contrée reculée, dont la teneur demeurait inchangée de génération en génération, le temps lui-même semblait suspendre son cours. On eût dit que le destin s'était emparé de ses habitants." },
};

const FALLBACK_CURIOSITIES = [
  { theme: "Geografia", fr: "Le mont Blanc, avec 4 806 mètres, est le plus haut sommet de France et d'Europe occidentale.", q: "Quelle est la plus haute montagne de France ?", keywords: ["mont blanc", "monte branco"] },
  { theme: "Geografia", fr: "La France métropolitaine compte cinq grands fleuves, dont la Loire, le plus long du pays.", q: "Quel est le plus long fleuve de France ?", keywords: ["loire"] },
  { theme: "Gastronomia", fr: "En France, il existe plus de 1 000 sortes de fromage différentes.", q: "Combien de sortes de fromage existe-t-il en France, environ ?", keywords: ["1000", "1 000", "mil"] },
  { theme: "Gastronomia", fr: "Le croissant n'est pas d'origine française : il vient de Vienne, en Autriche.", q: "De quelle ville vient à l'origine le croissant ?", keywords: ["vienne", "viena"] },
  { theme: "História", fr: "La prise de la Bastille a eu lieu le 14 juillet 1789.", q: "En quelle année a eu lieu la prise de la Bastille ?", keywords: ["1789"] },
  { theme: "História", fr: "La tour Eiffel a été construite pour l'Exposition universelle de 1889.", q: "Pour quel événement la tour Eiffel a-t-elle été construite ?", keywords: ["exposition", "exposicao", "1889", "universal"] },
  { theme: "Animais", fr: "Le loup est revenu naturellement dans les Alpes françaises dans les années 1990.", q: "Quel grand animal est revenu dans les Alpes françaises ?", keywords: ["lobo", "loup"] },
  { theme: "Animais", fr: "Le coq gaulois est un symbole national de la France.", q: "Quel animal est un symbole national de la France ?", keywords: ["coq", "galo"] },
  { theme: "Ciências", fr: "Louis Pasteur, l'inventeur de la pasteurisation, est né à Dole, en France.", q: "Dans quelle ville française est né Louis Pasteur ?", keywords: ["dole"] },
  { theme: "Ciências", fr: "Marie Curie a reçu deux prix Nobel, en physique et en chimie.", q: "Combien de prix Nobel Marie Curie a-t-elle reçus ?", keywords: ["deux", "dois", "2"] },
  { theme: "Cultura", fr: "Le Louvre, à Paris, est le musée le plus visité du monde.", q: "Quel est le musée le plus visité du monde ?", keywords: ["louvre"] },
  { theme: "Cultura", fr: "Le français est une langue officielle dans une trentaine de pays sur cinq continents.", q: "Sur combien de continents parle-t-on français comme langue officielle ?", keywords: ["cinq", "cinco", "5"] },
];

/* ---------------------- ARMAZENAMENTO ---------------------- */
const KEY = "frenchMasterState_v2";
const DEFAULT_STATE = {
  xp: 0, level: 1, streak: 0, bestStreak: 0, correct: 0, wrong: 0, difficulty: 3,
  theme: "tricolor", days: [], dailyGoal: 100, dailyXP: {}, badges: [],
  catStats: {}, grammarCorrect: 0, maxDifficultyUsed: 0,
  srs: {}, aiWords: [], usedSentences: [], sessionStats: null,
};

function useAppState() {
  const [blocked, setBlocked] = useState(false);
  const [state, setState] = useState(DEFAULT_STATE);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const tk = "__fm_t__";
      window.localStorage.setItem(tk, "1");
      window.localStorage.removeItem(tk);
      const saved = window.localStorage.getItem(KEY);
      if (saved) setState((s) => ({ ...DEFAULT_STATE, ...JSON.parse(saved) }));
    } catch (e) { setBlocked(true); }
    loaded.current = true;
  }, []);

  const save = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!blocked) {
        try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* cheio/bloqueado */ }
      }
      return next;
    });
  }, [blocked]);

  return { state, save, blocked };
}

/* ---------------------- CONFETE (canvas real) ---------------------- */
function Confetti({ colors }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const parts = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width, y: -20 - Math.random() * canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4,
      size: 4 + Math.random() * 6, rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    let raf, running = true;
    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { running = false; cancelAnimationFrame(raf); };
  }, [colors]);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 70 }} />;
}

/* ================================ APP ================================ */
export default function FrenchMaster() {
  const { state, save, blocked } = useAppState();
  const [tab, setTab] = useState("phrases");
  const [celebrate, setCelebrate] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [toast, setToast] = useState(null);
  const [newBadge, setNewBadge] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const sessionRef = useRef({ right: 0, wrong: 0, newWords: 0, startedAt: Date.now() });

  const theme = THEMES[state.theme] || THEMES.tricolor;
  const xpToNext = state.level * 100;
  const band = CEFR[state.difficulty];
  const allWords = useMemo(() => [...BASE_WORDS, ...(state.aiWords || [])], [state.aiWords]);
  const weakCat = weakestCategory(state.catStats);
  const cefrEstimate = estimateCEFR(state.srs, state);
  const today = todayKey();
  const dailyXPToday = (state.dailyXP || {})[today] || 0;

  /* boost adaptativo: streak ≥10 → +1 nível temporário */
  const boost = state.streak >= 10 ? 1 : 0;

  const registerResult = useCallback((isCorrect, xpGain = 10, wordKey = null, category = null, isGrammar = false) => {
    if (isCorrect) sessionRef.current.right += 1; else sessionRef.current.wrong += 1;
    setSessionCount((c) => c + 1);
    save((prev) => {
      let { xp, level, streak, bestStreak, correct, wrong } = prev;
      const srs = { ...prev.srs };
      if (wordKey) {
        if (!srs[wordKey]) sessionRef.current.newWords += 1;
        srs[wordKey] = srsUpdate(srs[wordKey], isCorrect);
      }
      const catStats = { ...prev.catStats };
      if (category) {
        const cs = catStats[category] || { right: 0, wrong: 0 };
        catStats[category] = { right: cs.right + (isCorrect ? 1 : 0), wrong: cs.wrong + (isCorrect ? 0 : 1) };
      }
      let grammarCorrect = prev.grammarCorrect || 0;
      if (isGrammar && isCorrect) grammarCorrect += 1;
      let gain = 0;
      if (isCorrect) {
        streak += 1; correct += 1;
        gain = xpGain + (boost ? 5 : 0);
        if (streak % 10 === 0) { gain += 30; setCelebrate(true); setTimeout(() => setCelebrate(false), 2600); }
        else if (streak % 5 === 0) gain += 10;
        xp += gain;
        bestStreak = Math.max(bestStreak, streak);
        let need = level * 100;
        let leveled = false;
        while (xp >= need) { xp -= need; level += 1; need = level * 100; leveled = true; }
        if (leveled) { setLevelUp(true); setTimeout(() => setLevelUp(false), 2200); }
        setToast({ ok: true, msg: `+${gain} XP${boost ? " ⚡bônus desafio" : ""}` });
      } else {
        streak = 0; wrong += 1;
        setToast({ ok: false, msg: "Não foi dessa vez" });
      }
      setTimeout(() => setToast(null), 1400);
      const days = prev.days.includes(today) ? prev.days : [...prev.days, today];
      const dailyXP = { ...(prev.dailyXP || {}), [today]: ((prev.dailyXP || {})[today] || 0) + gain };
      const maxDifficultyUsed = Math.max(prev.maxDifficultyUsed || 0, prev.difficulty);
      const next = { ...prev, xp, level, streak, bestStreak, correct, wrong, srs, catStats, grammarCorrect, days, dailyXP, maxDifficultyUsed };
      // badges
      const earned = BADGES.filter((b) => !next.badges.includes(b.id) && b.test(next, srs));
      if (earned.length) {
        next.badges = [...next.badges, ...earned.map((b) => b.id)];
        setNewBadge(earned[0]);
        setTimeout(() => setNewBadge(null), 3200);
      }
      return next;
    });
  }, [save, boost, today]);

  /* gera palavras novas via IA quando o banco do nível está muito visto */
  const fetchNewWords = useCallback(async () => {
    try {
      const existing = allWords.filter((w) => Math.abs(w.l - state.difficulty) <= 1.5).map((w) => w.g).join(", ");
      const prompt = `Gere 8 palavras francesas NOVAS de nível ${band} (CEFR) para um estudante brasileiro. Evite cognatos óbvios com o português. NÃO repita nenhuma destas: ${existing}. Substantivos DEVEM ter artigo (le/la/l') e, se o artigo for l', indique o gênero na tradução, ex.: "a água (f.)". Classifique: "V"=verbo, "S"=substantivo, "A"=adjetivo, "K"=conector. Responda APENAS com array JSON: [{"g":"palavra em francês","t":"tradução pt-BR","c":"V|S|A|K","l":${state.difficulty}}]`;
      const raw = await askClaude(prompt, 700);
      const parsed = robustJSONParse(raw);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter((w) => w.g && w.t && ["V", "S", "A", "K"].includes(w.c) && !allWords.find((x) => normalize(x.g) === normalize(w.g)))
          .map((w) => ({ ...w, l: Number(w.l) || state.difficulty }));
        if (clean.length) save((prev) => ({ ...prev, aiWords: [...(prev.aiWords || []), ...clean] }));
        return clean.length;
      }
    } catch (e) { /* offline: segue com o banco base */ }
    return 0;
  }, [allWords, band, state.difficulty, save]);

  /* auto-expandir o banco quando >70% das palavras do nível já foram vistas */
  useEffect(() => {
    const pool = allWords.filter((w) => Math.abs(w.l - state.difficulty) <= 1.5);
    const seen = pool.filter((w) => state.srs[w.g]).length;
    if (pool.length > 0 && seen / pool.length > 0.7) fetchNewWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.difficulty, sessionCount > 0 && sessionCount % 20 === 0]);

  const setDifficulty = (v) => save((prev) => ({ ...prev, difficulty: v }));
  const setTheme = (t) => save((prev) => ({ ...prev, theme: t }));

  const TABS = [
    { id: "phrases", label: "🗣️ Phrases", sub: "Frases" },
    { id: "vocab", label: "📚 Vocabulaire", sub: "Vocabulário" },
    { id: "associer", label: "🔗 Associer", sub: "Conectar" },
    { id: "choix", label: "🎯 Choix", sub: "Escolha" },
    { id: "grammaire", label: "📐 Grammaire", sub: "Gramática" },
    { id: "histoires", label: "📖 Histoires", sub: "Histórias" },
    { id: "saviez", label: "🌍 Le saviez-vous", sub: "Curiosidades" },
    { id: "progres", label: "📊 Progrès", sub: "Progresso" },
  ];

  const flameSize = Math.min(34, 16 + state.streak * 1.2);

  const commonProps = { theme, allWords, srs: state.srs, difficulty: state.difficulty, band, boost, onResult: registerResult, weakCat };

  return (
    <div className="app" style={{ background: theme.bg, color: theme.text }}>
      <style>{buildCSS(theme)}</style>
      <div className="grain" />
      <div className="orb orb1" style={{ background: theme.orbA }} />
      <div className="orb orb2" style={{ background: theme.orbB }} />
      <div className="orb orb3" style={{ background: theme.orbC }} />

      {blocked && (
        <div className="storage-warning fadeIn">
          ⚠️ Armazenamento local bloqueado neste ambiente — o progresso não será salvo aqui. Exporte o app para persistência completa.
        </div>
      )}

      <header className="header fadeIn">
        <div className="header-top">
          <h1 className={levelUp ? "glow-gold" : ""}>🇫🇷 French Master</h1>
          <div className="theme-picker">
            {Object.entries(THEMES).map(([id, t]) => (
              <button key={id} title={t.name} className={`theme-dot ${state.theme === id ? "active" : ""}`}
                style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }}
                onClick={() => setTheme(id)} aria-label={`Tema ${t.name}`} />
            ))}
          </div>
        </div>
        <p className="subtitle">
          Do zero ao nível literário{cefrEstimate ? <> · nível estimado: <b style={{ color: theme.accent }}>{cefrEstimate}</b></> : null}
        </p>

        <div className="stats-row">
          <div className="stat-card glass">
            <span className="stat-label">Nível</span>
            <span className="stat-value">{state.level}</span>
          </div>
          <div className="stat-card glass xp-card">
            <span className="stat-label">XP</span>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${Math.min(100, (state.xp / xpToNext) * 100)}%` }}>
                <div className="xp-shimmer" />
              </div>
            </div>
            <span className="stat-sub">{state.xp}/{xpToNext}</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-label">Streak</span>
            <span className="stat-value" style={{ fontSize: flameSize }}>🔥<span style={{ fontSize: 16 }}>{state.streak}</span></span>
          </div>
          <div className="stat-card glass">
            <span className="stat-label">Meta diária</span>
            <div className="ring" style={{ "--pct": Math.min(100, (dailyXPToday / state.dailyGoal) * 100) + "%" }}>
              <span>{Math.min(100, Math.round((dailyXPToday / state.dailyGoal) * 100))}%</span>
            </div>
          </div>
        </div>

        {boost > 0 && (
          <div className="boost-banner pop">⚡ Modo desafio ativo! Sequência de {state.streak} — exercícios um nível acima + XP bônus</div>
        )}
        {weakCat && (
          <div className="weak-banner fadeIn">🎯 Ponto fraco detectado: <b>{TYPE_LABEL[weakCat] || weakCat}</b> — o app vai reforçar isso</div>
        )}

        <div className="difficulty-box glass">
          <div className="difficulty-header">
            <span>Dificuldade: <b style={{ color: theme.accent }}>{state.difficulty}</b> — {band}{boost ? ` (desafio: ${CEFR[Math.min(10, state.difficulty + 1)]})` : ""}</span>
          </div>
          <input type="range" min="0" max="10" value={state.difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))} className="difficulty-slider" />
          <div className="difficulty-scale"><span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span><span>C2</span></div>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => { setTab(t.id); }}>
            <span className="tab-emoji">{t.label.split(" ")[0]}</span>
            <span className="tab-text">{t.label.split(" ").slice(1).join(" ")}</span>
            <span className="tab-sub">{t.sub}</span>
          </button>
        ))}
      </nav>

      <main className="content" key={tab}>
        <div className="tab-slide">
          {tab === "phrases" && <PhrasesTab {...commonProps} />}
          {tab === "vocab" && <VocabulaireTab {...commonProps} />}
          {tab === "associer" && <AssocierTab {...commonProps} />}
          {tab === "choix" && <ChoixTab {...commonProps} />}
          {tab === "grammaire" && <GrammaireTab {...commonProps} />}
          {tab === "histoires" && <HistoiresTab {...commonProps} />}
          {tab === "saviez" && <SaviezVousTab {...commonProps} />}
          {tab === "progres" && <ProgresTab theme={theme} state={state} allWords={allWords} cefrEstimate={cefrEstimate} />}
        </div>
      </main>

      {sessionCount > 0 && sessionCount % 15 === 0 && !showSummary && (
        <button className="summary-fab pop" onClick={() => setShowSummary(true)}>📋 Resumo da sessão</button>
      )}

      {toast && <div className={`toast ${toast.ok ? "toast-ok" : "toast-bad"} pop`}>{toast.msg}</div>}

      {newBadge && (
        <div className="badge-toast pop">
          <span className="badge-toast-emoji">{newBadge.emoji}</span>
          <div><b>Conquista desbloqueada!</b><br />{newBadge.name} — {newBadge.desc}</div>
        </div>
      )}

      {celebrate && (
        <>
          <Confetti colors={[theme.accent, theme.accent2, "#ffffff", theme.orbA]} />
          <div className="celebrate-overlay fadeIn" onClick={() => setCelebrate(false)}>
            <div className="celebrate-card pop">
              <div className="celebrate-emoji">🎉🔥🎉</div>
              <div className="celebrate-title">Sequência de {state.streak}!</div>
              <div className="celebrate-sub">+30 XP bônus · modo desafio ativado</div>
            </div>
          </div>
        </>
      )}

      {showSummary && (
        <div className="celebrate-overlay fadeIn" onClick={() => setShowSummary(false)}>
          <div className="celebrate-card pop" onClick={(e) => e.stopPropagation()}>
            <div className="celebrate-emoji">📋</div>
            <div className="celebrate-title">Sessão de hoje</div>
            <div className="summary-grid">
              <div><b>{sessionRef.current.right}</b><span>acertos</span></div>
              <div><b>{sessionRef.current.wrong}</b><span>erros</span></div>
              <div><b>{sessionRef.current.newWords}</b><span>palavras novas</span></div>
              <div><b>{sessionRef.current.right + sessionRef.current.wrong > 0 ? Math.round((sessionRef.current.right / (sessionRef.current.right + sessionRef.current.wrong)) * 100) : 0}%</b><span>precisão</span></div>
            </div>
            <button className="btn-secondary" onClick={() => setShowSummary(false)}>Continuar praticando</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Aquecimento: palavras fracas antes do conteúdo ============ */
function useWarmup(allWords, srs, difficulty) {
  return useMemo(() => {
    const now = Date.now();
    return allWords
      .filter((w) => srs[w.g] && srs[w.g].box <= 1 && srs[w.g].due <= now && Math.abs(w.l - difficulty) <= 2.5)
      .sort((a, b) => srs[a.g].box - srs[b.g].box)
      .slice(0, 5);
  }, [allWords, srs, difficulty]);
}

/* ============================== PHRASES ============================== */
function PhrasesTab({ theme, allWords, srs, difficulty, band, boost, onResult, weakCat }) {
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState("fr-pt");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(0);
  const usedRef = useRef(new Set());

  const effBand = CEFR[Math.min(10, difficulty + boost)];

  const loadFallback = useCallback(() => {
    const pool = (FALLBACK_SENTENCES[effBand] || FALLBACK_SENTENCES.A1).filter((s) => !usedRef.current.has(s.fr));
    const final = pool.length ? pool : FALLBACK_SENTENCES[effBand] || FALLBACK_SENTENCES.A1;
    setItems(shuffle(final));
    setIdx(0);
  }, [effBand]);

  const loadFromAPI = useCallback(async () => {
    setLoading(true);
    try {
      const weakWords = pickWords(allWords, srs, difficulty, 4, boost).map((w) => w.g).join(", ");
      const avoid = [...usedRef.current].slice(-15).join(" | ");
      const focus = weakCat ? ` Dê ênfase a ${TYPE_LABEL[weakCat]}.` : "";
      const prompt = `Gere 5 frases NOVAS em francês, nível ${effBand} (CEFR), para tradução FR↔PT (Brasil). Use de preferência estas palavras que o estudante está aprendendo: ${weakWords}.${focus} Evite cognatos com o português. NÃO gere frases parecidas com estas já usadas: ${avoid || "nenhuma"}. Inclua uma dica gramatical curta em português para cada frase. Responda APENAS array JSON: [{"fr":"...","pt":"...","tip":"dica gramatical em pt-BR"}]`;
      const raw = await askClaude(prompt, 900);
      const parsed = robustJSONParse(raw);
      if (Array.isArray(parsed) && parsed.length && parsed[0].fr && parsed[0].pt) {
        setItems(parsed);
        setIdx(0);
      } else loadFallback();
    } catch (e) { loadFallback(); }
    finally { setLoading(false); }
  }, [effBand, allWords, srs, difficulty, boost, weakCat, loadFallback]);

  useEffect(() => { loadFromAPI(); /* eslint-disable-next-line */ }, [effBand]);

  const current = items[idx];

  function check() {
    if (!current) return;
    usedRef.current.add(current.fr);
    const target = direction === "fr-pt" ? current.pt : current.fr;
    const ok = similar(answer, target);
    setFeedback({ ok, target, tip: current.tip, diff: wordDiff(answer, target) });
    onResult(ok, 12 - hint * 2, null, "sentences");
  }

  function next() {
    setAnswer(""); setFeedback(null); setHint(0);
    if (idx + 1 < items.length) setIdx(idx + 1);
    else loadFromAPI();
    setDirection(Math.random() > 0.5 ? "fr-pt" : "pt-fr");
  }

  if (loading && items.length === 0) return <LoadingCard theme={theme} text="Gerando frases novas..." />;
  if (!current) return <LoadingCard theme={theme} text="Carregando..." />;

  const promptText = direction === "fr-pt" ? current.fr : current.pt;
  const target = direction === "fr-pt" ? current.pt : current.fr;

  return (
    <div className="card glass fadeIn">
      <div className="card-eyebrow">
        Frase {idx + 1}/{items.length} · {direction === "fr-pt" ? "🇫🇷 → 🇧🇷" : "🇧🇷 → 🇫🇷"} · {effBand}
        {boost ? " ⚡" : ""}
      </div>
      <div className="sentence-prompt">
        {promptText}
        {direction === "fr-pt" && (
          <button className="tts-btn" onClick={() => speak(current.fr)} aria-label="Ouvir">🔊</button>
        )}
      </div>
      <textarea className="text-input" rows={2} placeholder="Digite a tradução..."
        value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={!!feedback} />
      {!feedback ? (
        <>
          <button className="btn-primary" onClick={check} disabled={!answer.trim()}>Verificar</button>
          <button className="btn-hint" onClick={() => setHint((h) => Math.min(3, h + 1))}>
            💡 Dica ({hint}/3)
          </button>
          {hint >= 1 && <div className="hint-box fadeIn">Começa com: <b>{target.slice(0, 3)}...</b></div>}
          {hint >= 2 && <div className="hint-box fadeIn">Nº de palavras: <b>{target.split(" ").length}</b></div>}
          {hint >= 3 && <div className="hint-box fadeIn">Metade: <b>{target.split(" ").slice(0, Math.ceil(target.split(" ").length / 2)).join(" ")}...</b></div>}
        </>
      ) : (
        <div className={`feedback-box ${feedback.ok ? "feedback-ok" : "feedback-bad shake"}`}>
          <div className="diff-line">
            {feedback.ok ? "✅ Correto! " : "❌ Resposta: "}
            {feedback.diff.map((w, i) => (
              <span key={i} className={w.ok ? "diff-ok" : "diff-miss"}>{w.word} </span>
            ))}
          </div>
          {feedback.tip && <div className="tip-line">📘 {feedback.tip}</div>}
          {direction === "pt-fr" && <button className="tts-btn-inline" onClick={() => speak(current.fr)}>🔊 ouvir em francês</button>}
          <button className="btn-secondary" onClick={next}>Próxima frase →</button>
        </div>
      )}
    </div>
  );
}

/* ============================== VOCABULAIRE ============================== */
function VocabulaireTab({ theme, allWords, srs, difficulty, boost, onResult }) {
  const warmup = useWarmup(allWords, srs, difficulty);
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const fresh = pickWords(allWords, srs, difficulty, 12, boost);
    const combined = [...warmup.filter((w) => !fresh.find((f) => f.g === w.g)), ...fresh];
    setDeck(combined);
    setIdx(0); setFlipped(false);
    // eslint-disable-next-line
  }, [difficulty, round, allWords.length]);

  if (deck.length === 0) return <LoadingCard theme={theme} text="Montando baralho..." />;
  const card = deck[idx % deck.length];
  const entry = srs[card.g];
  const strength = entry ? Math.min(5, entry.box) : 0;
  const isWarm = warmup.find((w) => w.g === card.g);
  const ff = FALSE_FRIENDS.find((f) => normalize(f.g) === normalize(card.g));

  function assess(knew) {
    onResult(knew, 8, card.g, card.c);
    setFlipped(false);
    if (idx + 1 >= deck.length) setRound((r) => r + 1);
    else setIdx((i) => i + 1);
  }

  const color = articleColor(card.g, card.c, theme);

  return (
    <div className="card glass fadeIn">
      <div className="card-eyebrow">
        Carta {(idx % deck.length) + 1}/{deck.length}
        {isWarm && <span className="warm-tag"> · 🔁 revisão de palavra fraca</span>}
      </div>
      <div className="strength-row" aria-label={`Força na memória: ${strength} de 5`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`strength-seg ${i < strength ? "on" : ""}`} />
        ))}
        <span className="strength-label">{strength >= 4 ? "dominada" : strength >= 2 ? "aprendendo" : entry ? "fraca" : "nova"}</span>
      </div>
      <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front" style={{ boxShadow: `0 8px 40px ${color}22` }}>
            <span className="type-badge" style={{ background: color + "26", color }}>{TYPE_LABEL[card.c]}</span>
            <div className="flashcard-word" style={{ color }}>{card.g}</div>
            <button className="tts-btn" onClick={(e) => { e.stopPropagation(); speak(card.g); }}>🔊</button>
            <div className="flashcard-hint">toque para virar</div>
          </div>
          <div className="flashcard-face flashcard-back">
            <div className="flashcard-word">{card.t}</div>
            {ff && <div className="ff-warning">⚠️ Faux ami! NÃO é "{ff.wrong}"</div>}
          </div>
        </div>
      </div>
      {flipped && (
        <div className="assess-row fadeIn">
          <button className="btn-bad" onClick={() => assess(false)}>❌ Não sabia</button>
          <button className="btn-ok" onClick={() => assess(true)}>✅ Sabia</button>
        </div>
      )}
    </div>
  );
}

/* ============================== ASSOCIER ============================== */
function AssocierTab({ theme, allWords, srs, difficulty, boost, onResult }) {
  const [pairs, setPairs] = useState([]);
  const [rightOrder, setRightOrder] = useState([]);
  const [selLeft, setSelLeft] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongFlash, setWrongFlash] = useState(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const pool = pickWords(allWords, srs, difficulty, 6, boost);
    setPairs(pool);
    setRightOrder(shuffle(pool));
    setMatched([]); setSelLeft(null);
    // eslint-disable-next-line
  }, [difficulty, round, allWords.length]);

  if (pairs.length === 0) return <LoadingCard theme={theme} text="Preparando jogo..." />;

  function pickRight(word) {
    if (!selLeft || matched.includes(word.g)) return;
    if (word.g === selLeft.g) {
      setMatched((m) => [...m, word.g]);
      onResult(true, 10, word.g, word.c);
      setSelLeft(null);
      if (matched.length + 1 === pairs.length) setTimeout(() => setRound((r) => r + 1), 900);
    } else {
      setWrongFlash(word.g);
      onResult(false, 0, selLeft.g, selLeft.c);
      setTimeout(() => setWrongFlash(null), 500);
      setSelLeft(null);
    }
  }

  return (
    <div className="card glass fadeIn">
      <div className="card-eyebrow">Una a palavra francesa à tradução {boost ? "· ⚡ modo desafio" : ""}</div>
      <div className="match-grid">
        <div className="match-col">
          {pairs.map((w) => (
            <button key={w.g}
              className={`match-item ${matched.includes(w.g) ? "matched" : ""} ${selLeft?.g === w.g ? "selected" : ""}`}
              style={{ borderColor: articleColor(w.g, w.c, theme) + "88" }}
              onClick={() => !matched.includes(w.g) && setSelLeft(w)}
              disabled={matched.includes(w.g)}>
              {w.g}
            </button>
          ))}
        </div>
        <div className="match-col">
          {rightOrder.map((w) => (
            <button key={w.g + "-t"}
              className={`match-item ${matched.includes(w.g) ? "matched" : ""} ${wrongFlash === w.g ? "shake wrong" : ""}`}
              onClick={() => pickRight(w)} disabled={matched.includes(w.g)}>
              {w.t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== CHOIX ============================== */
function ChoixTab({ theme, allWords, srs, difficulty, boost, onResult, weakCat }) {
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [picked, setPicked] = useState(null);
  const lastRef = useRef([]);

  const load = useCallback(() => {
    let pool = pickWords(allWords, srs, difficulty, 20, boost).filter((w) => !lastRef.current.includes(w.g));
    if (weakCat && pool.some((w) => w.c === weakCat) && Math.random() < 0.5) {
      pool = pool.filter((w) => w.c === weakCat);
    }
    if (!pool.length) { lastRef.current = []; pool = pickWords(allWords, srs, difficulty, 20, boost); }
    const word = pool[Math.floor(Math.random() * pool.length)];
    lastRef.current = [...lastRef.current.slice(-8), word.g];
    const allPool = allWords.filter((w) => Math.abs(w.l - difficulty) <= 2.5);
    let distractors = shuffle(allPool.filter((w) => w.g !== word.g && w.c === word.c)).slice(0, 3);
    if (distractors.length < 3) distractors = shuffle(allPool.filter((w) => w.g !== word.g)).slice(0, 3);
    setQuestion(word);
    setOptions(shuffle([word, ...distractors]));
    setPicked(null);
  }, [allWords, srs, difficulty, boost, weakCat]);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [difficulty, allWords.length]);

  if (!question) return <LoadingCard theme={theme} text="Preparando pergunta..." />;

  function choose(opt) {
    if (picked) return;
    setPicked(opt);
    onResult(opt.g === question.g, 8, question.g, question.c);
    setTimeout(load, 1100);
  }

  return (
    <div className="card glass fadeIn">
      <div className="card-eyebrow">Qual é a tradução correta? {boost ? "⚡" : ""}</div>
      <div className="mc-word" style={{ color: articleColor(question.g, question.c, theme) }}>
        {question.g}
        <button className="tts-btn" onClick={() => speak(question.g)}>🔊</button>
      </div>
      <div className="mc-grid">
        {options.map((opt) => {
          let cls = "mc-option";
          if (picked) {
            if (opt.g === question.g) cls += " mc-correct pop";
            else if (opt.g === picked.g) cls += " mc-wrong shake";
          }
          return (
            <button key={opt.g} className={cls} onClick={() => choose(opt)} disabled={!!picked}>{opt.t}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== GRAMMAIRE ============================== */
function GrammaireTab({ theme, difficulty, boost, onResult }) {
  const [ex, setEx] = useState(null);
  const [picked, setPicked] = useState(null);
  const [orderPick, setOrderPick] = useState([]);
  const [aiEx, setAiEx] = useState([]);
  const usedRef = useRef(new Set());
  const [loadingAI, setLoadingAI] = useState(false);

  const effDiff = Math.min(10, difficulty + boost);

  const pickExercise = useCallback(() => {
    const all = [...GRAMMAR_EXERCISES, ...aiEx];
    let pool = all.filter((e) => Math.abs(e.l - effDiff) <= 2 && !usedRef.current.has(e.prompt || e.answer));
    if (!pool.length) { usedRef.current.clear(); pool = all.filter((e) => Math.abs(e.l - effDiff) <= 2); }
    if (!pool.length) pool = all;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    usedRef.current.add(chosen.prompt || chosen.answer);
    setEx(chosen);
    setPicked(null);
    setOrderPick([]);
  }, [effDiff, aiEx]);

  const fetchAIGrammar = useCallback(async () => {
    if (loadingAI) return;
    setLoadingAI(true);
    try {
      const band = CEFR[effDiff];
      const prompt = `Crie 4 exercícios de gramática francesa nível ${band} para brasileiro, cada um de múltipla escolha (4 opções), focando em: artigos e partitivo (du/de la/de l'/des/de), pronomes complemento (le/la/lui/leur/y/en) e sua ordem, passé composé (être vs avoir + concordância do particípio), subjuntivo ou posição/concordância de adjetivos. Responda APENAS array JSON: [{"kind":"art","l":${effDiff},"prompt":"frase com lacuna ___","options":["a","b","c","d"],"answer":"opção correta exata","explain":"explicação curta em pt-BR"}]`;
      const raw = await askClaude(prompt, 900);
      const parsed = robustJSONParse(raw);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter((e) => e.prompt && Array.isArray(e.options) && e.options.includes(e.answer));
        if (clean.length) setAiEx((prev) => [...prev, ...clean]);
      }
    } catch (e) { /* fallback: banco local */ }
    finally { setLoadingAI(false); }
  }, [effDiff, loadingAI]);

  useEffect(() => { pickExercise(); /* eslint-disable-next-line */ }, [difficulty]);
  useEffect(() => {
    if (usedRef.current.size > 0 && usedRef.current.size % 8 === 0) fetchAIGrammar();
    // eslint-disable-next-line
  }, [ex]);

  if (!ex) return <LoadingCard theme={theme} text="Preparando gramática..." />;

  const KIND_LABEL = { art: "Artigos & partitivo", order: "Ordem dos pronomes", pron: "Pronomes (COD/COI/y/en)", pc: "Passé composé & concordância", adj: "Adjetivos", error: "Detector de erro" };

  /* exercício de reordenar */
  if (ex.kind === "order") {
    const remaining = ex.words.filter((w, i) => !orderPick.includes(i));
    const done = orderPick.length === ex.words.length;
    const userSentence = orderPick.map((i) => ex.words[i]).join(" ");
    const ok = done && normalize(userSentence) === normalize(ex.answer);
    return (
      <div className="card glass fadeIn">
        <div className="card-eyebrow">📐 {KIND_LABEL[ex.kind]} · monte a frase na ordem correta</div>
        <div className="order-built">{userSentence || "…toque nas palavras abaixo…"}</div>
        <div className="order-pool">
          {ex.words.map((w, i) => (
            <button key={i} className={`order-chip ${orderPick.includes(i) ? "used" : ""}`}
              onClick={() => !orderPick.includes(i) && !done && setOrderPick((p) => [...p, i])}
              disabled={orderPick.includes(i) || done}>{w}</button>
          ))}
        </div>
        {orderPick.length > 0 && !done && (
          <button className="btn-hint" onClick={() => setOrderPick((p) => p.slice(0, -1))}>↩︎ desfazer</button>
        )}
        {done && !picked && (
          <button className="btn-primary" onClick={() => { setPicked(true); onResult(ok, 14, null, "grammar", true); }}>Verificar</button>
        )}
        {picked && (
          <div className={`feedback-box ${ok ? "feedback-ok" : "feedback-bad shake"}`}>
            {ok ? "✅ Perfeito!" : `❌ Ordem correta: "${ex.answer}"`}
            <div className="tip-line">📘 {ex.explain}</div>
            <button className="btn-secondary" onClick={pickExercise}>Próximo exercício →</button>
          </div>
        )}
      </div>
    );
  }

  /* múltipla escolha (art/pron/pc/adj/error) */
  function choose(opt) {
    if (picked) return;
    setPicked(opt);
    onResult(opt === ex.answer, 12, null, "grammar", true);
  }

  return (
    <div className="card glass fadeIn">
      <div className="card-eyebrow">📐 {KIND_LABEL[ex.kind] || "Gramática"} · {CEFR[ex.l] || ""}</div>
      <div className="grammar-prompt">{ex.prompt}</div>
      <div className="mc-grid">
        {ex.options.map((opt) => {
          let cls = "mc-option";
          if (picked) {
            if (opt === ex.answer) cls += " mc-correct pop";
            else if (opt === picked) cls += " mc-wrong shake";
          }
          return <button key={opt} className={cls} onClick={() => choose(opt)} disabled={!!picked}>{opt}</button>;
        })}
      </div>
      {picked && (
        <div className={`feedback-box fadeIn ${picked === ex.answer ? "feedback-ok" : "feedback-bad"}`} style={{ marginTop: 12 }}>
          <div className="tip-line">📘 {ex.explain}</div>
          <button className="btn-secondary" onClick={pickExercise}>Próximo exercício →</button>
        </div>
      )}
    </div>
  );
}

/* ============================== HISTOIRES ============================== */
function HistoiresTab({ theme, band, boost, difficulty, onResult }) {
  const [story, setStory] = useState(null);
  const [chapter, setChapter] = useState(1);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState(null);
  const prevRef = useRef(null);

  const effBand = CEFR[Math.min(10, difficulty + boost)];

  const loadStory = useCallback(async (continueSeries) => {
    setLoading(true); setResult(null); setSummary("");
    try {
      const seriesPart = continueSeries && prevRef.current
        ? `Esta é a CONTINUAÇÃO (capítulo ${chapter + 1}) da história anterior: "${prevRef.current.text}". Continue a narrativa com os mesmos personagens.`
        : "Comece uma história nova (capítulo 1).";
      const prompt = `${seriesPart} Escreva uma micro-história em francês, nível ${effBand} (CEFR), 40-80 palavras, envolvente e original. Responda APENAS JSON: {"title":"título em francês","text":"história em francês"}`;
      const raw = await askClaude(prompt, 650);
      const parsed = robustJSONParse(raw);
      if (parsed && parsed.title && parsed.text) {
        setStory(parsed);
        prevRef.current = parsed;
        setChapter(continueSeries ? chapter + 1 : 1);
      } else {
        setStory(FALLBACK_STORIES[effBand] || FALLBACK_STORIES.A1);
        setChapter(1);
      }
    } catch (e) {
      setStory(FALLBACK_STORIES[effBand] || FALLBACK_STORIES.A1);
      setChapter(1);
    } finally { setLoading(false); }
  }, [effBand, chapter]);

  useEffect(() => { loadStory(false); /* eslint-disable-next-line */ }, [effBand]);

  async function submitSummary() {
    if (!summary.trim() || !story) return;
    setGrading(true);
    try {
      const prompt = `História em francês:\n"${story.text}"\n\nResumo em português de um estudante brasileiro:\n"${summary}"\n\nAvalie se mostra compreensão geral (não precisa ser perfeito). Responda APENAS JSON: {"correct": true ou false, "feedback": "comentário breve e encorajador em pt-BR, citando um detalhe da história"}`;
      const raw = await askClaude(prompt, 400);
      const parsed = robustJSONParse(raw);
      if (parsed && typeof parsed.correct === "boolean") {
        setResult(parsed);
        onResult(parsed.correct, 20, null, "stories");
      } else setResult({ correct: true, feedback: "Não foi possível avaliar automaticamente — revise com calma." });
    } catch (e) {
      setResult({ correct: true, feedback: "Sem conexão com a IA para avaliar. Continue praticando!" });
    } finally { setGrading(false); }
  }

  if (loading || !story) return <LoadingCard theme={theme} text="Escrevendo história..." />;

  return (
    <div className="card glass fadeIn">
      <div className="card-eyebrow">📖 Capítulo {chapter} · {effBand} · resuma em português</div>
      <div className="story-title">{story.title} <button className="tts-btn" onClick={() => speak(story.text)}>🔊</button></div>
      <div className="story-text">{story.text}</div>
      {!result ? (
        <>
          <textarea className="text-input" rows={3} placeholder="Escreva um resumo em português..."
            value={summary} onChange={(e) => setSummary(e.target.value)} />
          <button className="btn-primary" onClick={submitSummary} disabled={!summary.trim() || grading}>
            {grading ? "Avaliando..." : "Enviar resumo"}
          </button>
        </>
      ) : (
        <div className={`feedback-box ${result.correct ? "feedback-ok" : "feedback-bad shake"}`}>
          {result.correct ? "✅ " : "💭 "}{result.feedback}
          <div className="story-actions">
            <button className="btn-secondary" onClick={() => loadStory(true)}>Continuar série → cap. {chapter + 1}</button>
            <button className="btn-secondary" onClick={() => loadStory(false)}>Nova história</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== LE SAVIEZ-VOUS ============================== */
function SaviezVousTab({ theme, band, boost, difficulty, onResult }) {
  const [themes, setThemes] = useState([...CURIOSITY_THEMES]);
  const [item, setItem] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState(null);
  const usedRef = useRef(new Set());

  const effBand = CEFR[Math.min(10, difficulty + boost)];

  const load = useCallback(async () => {
    setLoading(true); setResult(null); setAnswer("");
    try {
      const active = themes.length ? themes : CURIOSITY_THEMES;
      const th = active[Math.floor(Math.random() * active.length)];
      const avoid = [...usedRef.current].slice(-10).join(" | ");
      const prompt = `Crie uma curiosidade REAL e interessante sobre países de língua francesa (França, Bélgica, Suíça, Canadá, África francófona...), tema "${th}", escrita em francês nível ${effBand}. Não repita: ${avoid || "nenhuma"}. Depois uma pergunta em francês respondível em poucas palavras. Responda APENAS JSON: {"theme":"${th}","fr":"curiosidade em francês","q":"pergunta em francês"}`;
      const raw = await askClaude(prompt, 500);
      const parsed = robustJSONParse(raw);
      if (parsed && parsed.fr && parsed.q) {
        usedRef.current.add(parsed.fr.slice(0, 60));
        setItem(parsed);
      } else {
        const pool = FALLBACK_CURIOSITIES.filter((c) => active.includes(c.theme));
        setItem((pool.length ? pool : FALLBACK_CURIOSITIES)[Math.floor(Math.random() * (pool.length || FALLBACK_CURIOSITIES.length))]);
      }
    } catch (e) {
      const active = themes.length ? themes : CURIOSITY_THEMES;
      const pool = FALLBACK_CURIOSITIES.filter((c) => active.includes(c.theme));
      setItem((pool.length ? pool : FALLBACK_CURIOSITIES)[Math.floor(Math.random() * (pool.length || FALLBACK_CURIOSITIES.length))]);
    } finally { setLoading(false); }
  }, [themes, effBand]);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [effBand]);

  async function submitAnswer() {
    if (!answer.trim() || !item) return;
    setGrading(true);
    try {
      if (item.keywords) {
        const na = normalize(answer);
        const ok = item.keywords.some((k) => na.includes(normalize(k)));
        setResult({ correct: ok, feedback: ok ? "Muito bem!" : "Quase! Releia a curiosidade acima." });
        onResult(ok, 15, null, "curiosities");
      } else {
        const prompt = `Curiosidade (francês): "${item.fr}"\nPergunta: "${item.q}"\nResposta do estudante (pt-BR): "${answer}"\nAvalie se está correta. Responda APENAS JSON: {"correct": true ou false, "feedback": "comentário breve em pt-BR com a resposta certa"}`;
        const raw = await askClaude(prompt, 350);
        const parsed = robustJSONParse(raw);
        if (parsed && typeof parsed.correct === "boolean") {
          setResult(parsed);
          onResult(parsed.correct, 15, null, "curiosities");
        } else setResult({ correct: true, feedback: "Não foi possível avaliar automaticamente." });
      }
    } catch (e) {
      setResult({ correct: true, feedback: "Sem conexão com a IA para avaliar." });
    } finally { setGrading(false); }
  }

  if (loading || !item) return <LoadingCard theme={theme} text="Buscando curiosidade..." />;

  return (
    <div className="card glass fadeIn">
      <div className="card-eyebrow">Temas selecionáveis</div>
      <div className="theme-chips">
        {CURIOSITY_THEMES.map((th) => (
          <button key={th} className={`chip ${themes.includes(th) ? "chip-active" : ""}`}
            onClick={() => setThemes((ts) => ts.includes(th) ? ts.filter((x) => x !== th) : [...ts, th])}>{th}</button>
        ))}
      </div>
      <div className="curiosity-badge">{item.theme}</div>
      <div className="story-text">{item.fr} <button className="tts-btn" onClick={() => speak(item.fr)}>🔊</button></div>
      <div className="curiosity-question">❓ {item.q}</div>
      {!result ? (
        <>
          <textarea className="text-input" rows={2} placeholder="Responda em português..."
            value={answer} onChange={(e) => setAnswer(e.target.value)} />
          <button className="btn-primary" onClick={submitAnswer} disabled={!answer.trim() || grading}>
            {grading ? "Avaliando..." : "Responder"}
          </button>
        </>
      ) : (
        <div className={`feedback-box ${result.correct ? "feedback-ok" : "feedback-bad shake"}`}>
          {result.correct ? "✅ " : "💭 "}{result.feedback}
          <button className="btn-secondary" onClick={load}>Próxima curiosidade →</button>
        </div>
      )}
    </div>
  );
}

/* ============================== PROGRÈS ============================== */
function ProgresTab({ theme, state, allWords, cefrEstimate }) {
  const srs = state.srs || {};
  const entries = Object.entries(srs);
  const mastered = entries.filter(([, e]) => e.box >= 4).length;
  const learning = entries.filter(([, e]) => e.box >= 2 && e.box < 4).length;
  const weak = entries.filter(([, e]) => e.box < 2).length;

  /* heatmap por categoria */
  const cats = ["V", "S", "A", "K", "grammar", "sentences", "stories", "curiosities"];
  const catNames = { V: "Verbos", S: "Substantivos", A: "Adjetivos", K: "Conectores", grammar: "Gramática", sentences: "Frases", stories: "Histórias", curiosities: "Curiosidades" };

  /* calendário: últimos 28 dias */
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ k, xp: (state.dailyXP || {})[k] || 0 });
  }
  const maxXP = Math.max(1, ...days.map((d) => d.xp));

  const weakWords = entries.filter(([, e]) => e.box < 2 && e.seen >= 2)
    .sort((a, b) => (a[1].right / a[1].seen) - (b[1].right / b[1].seen)).slice(0, 8)
    .map(([g]) => allWords.find((w) => w.g === g)).filter(Boolean);

  return (
    <div className="fadeIn">
      <div className="card glass" style={{ marginBottom: 12 }}>
        <div className="card-eyebrow">📊 Visão geral</div>
        <div className="summary-grid">
          <div><b>{entries.length}</b><span>palavras praticadas</span></div>
          <div><b>{mastered}</b><span>dominadas 🧠</span></div>
          <div><b>{learning}</b><span>aprendendo</span></div>
          <div><b>{weak}</b><span>fracas 🔁</span></div>
        </div>
        {cefrEstimate && <div className="cefr-estimate">Nível CEFR estimado pelo desempenho: <b>{cefrEstimate}</b></div>}
        <div className="stat-line">Melhor sequência: 🔥 {state.bestStreak} · Total: ✅ {state.correct} · ❌ {state.wrong}</div>
      </div>

      <div className="card glass" style={{ marginBottom: 12 }}>
        <div className="card-eyebrow">🗓️ Calendário de prática (28 dias)</div>
        <div className="heatmap-cal">
          {days.map((d) => (
            <div key={d.k} className="cal-cell" title={`${d.k}: ${d.xp} XP`}
              style={{ opacity: d.xp ? 0.35 + 0.65 * (d.xp / maxXP) : 0.1, background: d.xp ? theme.accent : theme.sub }} />
          ))}
        </div>
        <div className="stat-line">{(state.days || []).length} dias de prática no total</div>
      </div>

      <div className="card glass" style={{ marginBottom: 12 }}>
        <div className="card-eyebrow">🌡️ Pontos fortes e fracos</div>
        {cats.map((c) => {
          const s = (state.catStats || {})[c];
          if (!s || s.right + s.wrong < 2) return null;
          const rate = s.right / (s.right + s.wrong);
          return (
            <div key={c} className="heat-row">
              <span className="heat-label">{catNames[c]}</span>
              <div className="heat-bar-track">
                <div className="heat-bar" style={{ width: `${rate * 100}%`, background: rate >= 0.75 ? "#4dd6a0" : rate >= 0.5 ? theme.accent : theme.accent2 }} />
              </div>
              <span className="heat-pct">{Math.round(rate * 100)}%</span>
            </div>
          );
        })}
      </div>

      {weakWords.length > 0 && (
        <div className="card glass" style={{ marginBottom: 12 }}>
          <div className="card-eyebrow">🔁 Palavras que mais precisam de revisão</div>
          <div className="weak-list">
            {weakWords.map((w) => (
              <div key={w.g} className="weak-item">
                <b style={{ color: articleColor(w.g, w.c, theme) }}>{w.g}</b> — {w.t}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card glass">
        <div className="card-eyebrow">🏅 Conquistas ({(state.badges || []).length}/{BADGES.length})</div>
        <div className="badge-grid">
          {BADGES.map((b) => {
            const has = (state.badges || []).includes(b.id);
            return (
              <div key={b.id} className={`badge-item ${has ? "earned" : ""}`} title={b.desc}>
                <span className="badge-emoji">{b.emoji}</span>
                <span className="badge-name">{b.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------- COMPONENTES AUXILIARES ---------------------- */
function LoadingCard({ theme, text }) {
  return (
    <div className="card glass fadeIn loading-card">
      <div className="skeleton-lines">
        <div className="skel" style={{ width: "40%" }} />
        <div className="skel" style={{ width: "85%" }} />
        <div className="skel" style={{ width: "70%" }} />
      </div>
      <div className="loading-text">{text}</div>
    </div>
  );
}

/* ---------------------- CSS ---------------------- */
function buildCSS(t) {
  return `
* { box-sizing: border-box; }
body { margin: 0; }
:root { color-scheme: dark; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
@keyframes pop { 0% { transform: scale(0.9);} 50% { transform: scale(1.05);} 100% { transform: scale(1);} }
@keyframes shake { 0%,100% { transform: translateX(0);} 20% { transform: translateX(-6px);} 40% { transform: translateX(6px);} 60% { transform: translateX(-4px);} 80% { transform: translateX(4px);} }
@keyframes float { 0%,100% { transform: translateY(0) translateX(0);} 50% { transform: translateY(-24px) translateX(14px);} }
@keyframes shimmer { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }
@keyframes slideIn { from { opacity: 0; transform: translateX(24px);} to { opacity: 1; transform: translateX(0);} }
@keyframes glowPulse { 0%,100% { text-shadow: 0 0 12px ${t.accent}66;} 50% { text-shadow: 0 0 28px ${t.accent}cc;} }
@keyframes skelPulse { 0%,100% { opacity: 0.35;} 50% { opacity: 0.7;} }

.fadeIn { animation: fadeIn 0.4s ease both; }
.pop { animation: pop 0.35s ease; }
.shake { animation: shake 0.4s ease; }
.tab-slide { animation: slideIn 0.3s ease both; }
.glow-gold { animation: glowPulse 1s ease 2; }

@media (prefers-reduced-motion: reduce) {
  .fadeIn, .pop, .shake, .tab-slide, .glow-gold, .orb, .xp-shimmer { animation: none !important; }
}

.app {
  min-height: 100vh; width: 100%; position: relative; overflow-x: hidden;
  font-family: 'Georgia', 'Times New Roman', serif;
  padding: 18px 14px 70px;
}
.app button, .app input, .app textarea { font-family: 'Segoe UI', system-ui, sans-serif; }

.grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.orb { position: fixed; border-radius: 50%; filter: blur(80px); opacity: 0.35; pointer-events: none; z-index: 0; }
.orb1 { width: 340px; height: 340px; top: -90px; left: -70px; animation: float 16s ease-in-out infinite; }
.orb2 { width: 260px; height: 260px; bottom: -70px; right: -50px; animation: float 20s ease-in-out infinite reverse; }
.orb3 { width: 200px; height: 200px; top: 42%; right: 8%; animation: float 24s ease-in-out infinite; }

.storage-warning {
  position: relative; z-index: 2; background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.35);
  color: #fde68a; padding: 10px 14px; border-radius: 12px; font-size: 13px; margin-bottom: 14px; text-align: center;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.header { position: relative; z-index: 1; text-align: center; margin-bottom: 16px; }
.header-top { display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; }
.header h1 {
  font-size: 30px; margin: 0; font-weight: 700; letter-spacing: 0.5px;
  background: linear-gradient(90deg, ${t.accent}, #ffffff, ${t.accent2});
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.theme-picker { position: absolute; right: 0; display: flex; gap: 6px; }
.theme-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; }
.theme-dot.active { border-color: #fff; transform: scale(1.15); }
.subtitle { margin: 4px 0 14px; color: ${t.sub}; font-size: 13px; font-style: italic; }

.glass {
  background: ${t.glass};
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${t.border}; border-radius: 18px;
}

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
.stat-card { padding: 10px 4px; display: flex; flex-direction: column; align-items: center; gap: 3px; min-height: 66px; justify-content: center; }
.stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: ${t.sub}; font-family: 'Segoe UI', sans-serif; }
.stat-value { font-size: 18px; font-weight: 800; font-family: 'Segoe UI', sans-serif; transition: font-size 0.3s ease; }
.stat-sub { font-size: 10px; color: ${t.sub}; }

.xp-bar-track { width: 100%; height: 7px; background: rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden; margin: 3px 0; position: relative; }
.xp-bar-fill { height: 100%; background: linear-gradient(90deg, ${t.accent}, ${t.accent2}); transition: width 0.5s ease; position: relative; overflow: hidden; }
.xp-shimmer { position: absolute; top: 0; left: 0; height: 100%; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent); animation: shimmer 2.2s ease infinite; }

.ring {
  width: 40px; height: 40px; border-radius: 50%;
  background: conic-gradient(${t.accent} var(--pct), rgba(255,255,255,0.08) var(--pct));
  display: flex; align-items: center; justify-content: center; position: relative;
}
.ring::before { content: ""; position: absolute; inset: 5px; border-radius: 50%; background: #0a0d16; }
.ring span { position: relative; font-size: 10px; font-weight: 800; font-family: 'Segoe UI', sans-serif; }

.boost-banner {
  background: linear-gradient(90deg, ${t.accent}22, ${t.accent2}22); border: 1px solid ${t.accent}66;
  color: ${t.accent}; border-radius: 12px; padding: 8px 12px; font-size: 12px; font-weight: 700;
  margin-bottom: 8px; font-family: 'Segoe UI', sans-serif;
}
.weak-banner {
  background: rgba(255,255,255,0.04); border: 1px dashed ${t.border}; color: ${t.sub};
  border-radius: 12px; padding: 7px 12px; font-size: 12px; margin-bottom: 8px; font-family: 'Segoe UI', sans-serif;
}

.difficulty-box { padding: 12px 16px; text-align: left; }
.difficulty-header { font-size: 13px; margin-bottom: 6px; font-family: 'Segoe UI', sans-serif; }
.difficulty-slider { width: 100%; accent-color: ${t.accent}; }
.difficulty-scale { display: flex; justify-content: space-between; font-size: 10px; color: ${t.sub}; margin-top: 2px; font-family: 'Segoe UI', sans-serif; }

.tabs { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin-bottom: 14px; }
.tab-btn {
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  background: rgba(255,255,255,0.03); border: 1px solid ${t.border};
  border-radius: 13px; padding: 8px 2px; color: ${t.sub}; cursor: pointer;
  transition: all 0.25s ease; font-size: 10px;
}
.tab-btn .tab-emoji { font-size: 17px; }
.tab-btn .tab-text { font-weight: 700; color: ${t.text}; font-size: 10px; }
.tab-btn .tab-sub { font-size: 8px; color: ${t.sub}; }
.tab-btn.active {
  background: linear-gradient(135deg, ${t.accent}2e, ${t.accent2}22);
  border-color: ${t.accent}88; transform: translateY(-2px);
  box-shadow: 0 6px 20px ${t.accent}2a;
}

.content { position: relative; z-index: 1; }
.card { padding: 18px 16px; }
.card-eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: ${t.accent}; margin-bottom: 10px; font-weight: 700; font-family: 'Segoe UI', sans-serif; }

.sentence-prompt { font-size: 21px; font-weight: 600; margin-bottom: 14px; line-height: 1.45; }
.grammar-prompt { font-size: 18px; font-weight: 600; margin-bottom: 14px; line-height: 1.5; }

.tts-btn { background: none; border: none; cursor: pointer; font-size: 17px; margin-left: 6px; opacity: 0.75; padding: 2px; }
.tts-btn:active { transform: scale(0.9); }
.tts-btn-inline { display: block; margin-top: 8px; background: none; border: 1px solid ${t.border}; border-radius: 100px; color: ${t.text}; padding: 5px 12px; font-size: 12px; cursor: pointer; }

.text-input {
  width: 100%; background: rgba(255,255,255,0.05); border: 1px solid ${t.border};
  border-radius: 12px; color: ${t.text}; padding: 12px; font-size: 15px; resize: none; margin-bottom: 12px;
}
.text-input:focus { outline: none; border-color: ${t.accent}; box-shadow: 0 0 0 3px ${t.accent}22; }

.btn-primary {
  width: 100%; padding: 13px; border-radius: 12px; border: none; cursor: pointer;
  background: linear-gradient(135deg, ${t.accent}, ${t.accent2}); color: #0a0d16; font-weight: 800; font-size: 15px;
  transition: transform 0.12s ease, opacity 0.15s ease;
}
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary:not(:disabled):active { transform: scale(0.97); }
.btn-primary:focus-visible, .btn-secondary:focus-visible, .mc-option:focus-visible, .tab-btn:focus-visible {
  outline: 2px solid ${t.accent}; outline-offset: 2px;
}

.btn-secondary {
  margin-top: 10px; width: 100%; padding: 11px; border-radius: 12px; border: 1px solid ${t.border};
  background: rgba(255,255,255,0.05); color: ${t.text}; font-weight: 600; cursor: pointer; font-size: 14px;
}
.btn-hint {
  margin-top: 8px; width: 100%; padding: 9px; border-radius: 12px; border: 1px dashed ${t.border};
  background: none; color: ${t.sub}; cursor: pointer; font-size: 13px;
}
.hint-box { margin-top: 8px; padding: 8px 12px; border-radius: 10px; background: ${t.accent}14; color: ${t.accent}; font-size: 13px; font-family: 'Segoe UI', sans-serif; }

.feedback-box { padding: 14px; border-radius: 12px; font-size: 14px; line-height: 1.55; font-family: 'Segoe UI', sans-serif; }
.feedback-ok { background: rgba(77,214,160,0.12); border: 1px solid rgba(77,214,160,0.4); color: #8ceec4; }
.feedback-bad { background: rgba(255,90,90,0.1); border: 1px solid rgba(255,90,90,0.38); color: #ffb0b0; }
.diff-line { margin-bottom: 6px; }
.diff-ok { color: #8ceec4; }
.diff-miss { color: #ffb0b0; text-decoration: underline; text-underline-offset: 3px; font-weight: 700; }
.tip-line { margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 13px; opacity: 0.95; font-style: italic; }

.strength-row { display: flex; align-items: center; gap: 3px; margin-bottom: 10px; }
.strength-seg { width: 22px; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.1); }
.strength-seg.on { background: linear-gradient(90deg, ${t.accent}, ${t.accent2}); }
.strength-label { font-size: 10px; color: ${t.sub}; margin-left: 6px; font-family: 'Segoe UI', sans-serif; }
.warm-tag { color: ${t.accent2}; text-transform: none; letter-spacing: 0; }

.flashcard { perspective: 1100px; cursor: pointer; height: 200px; margin-bottom: 6px; }
.flashcard-inner { position: relative; width: 100%; height: 100%; transition: transform 0.55s cubic-bezier(0.4, 0.1, 0.2, 1); transform-style: preserve-3d; }
.flashcard.flipped .flashcard-inner { transform: rotateY(180deg); }
.flashcard-face {
  position: absolute; inset: 0; backface-visibility: hidden; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px; border-radius: 16px;
  background: rgba(255,255,255,0.04); border: 1px solid ${t.border}; text-align: center; padding: 12px;
  transition: box-shadow 0.4s ease;
}
.flashcard-back { transform: rotateY(180deg); }
.flashcard-word { font-size: 27px; font-weight: 700; }
.flashcard-hint { font-size: 11px; color: ${t.sub}; font-family: 'Segoe UI', sans-serif; }
.type-badge { font-size: 11px; padding: 3px 11px; border-radius: 100px; font-weight: 700; font-family: 'Segoe UI', sans-serif; }
.ff-warning { font-size: 12px; color: #ffb84d; background: rgba(255,184,77,0.12); padding: 5px 10px; border-radius: 100px; font-family: 'Segoe UI', sans-serif; }

.assess-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
.btn-ok, .btn-bad { padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.btn-ok { background: rgba(77,214,160,0.16); color: #8ceec4; border: 1px solid rgba(77,214,160,0.4); }
.btn-bad { background: rgba(255,90,90,0.14); color: #ffb0b0; border: 1px solid rgba(255,90,90,0.38); }

.match-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.match-col { display: flex; flex-direction: column; gap: 8px; }
.match-item {
  padding: 12px 8px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1.5px solid ${t.border};
  color: ${t.text}; font-size: 13px; cursor: pointer; text-align: center; transition: all 0.2s ease;
}
.match-item.selected { border-color: ${t.accent}; background: ${t.accent}1c; }
.match-item.matched { background: rgba(77,214,160,0.12); border-color: rgba(77,214,160,0.45); opacity: 0.55; }
.match-item.wrong { border-color: #ff6b6b; background: rgba(255,90,90,0.14); }

.mc-word { font-size: 27px; font-weight: 700; text-align: center; margin: 8px 0 18px; }
.mc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mc-option {
  padding: 14px 8px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1.5px solid ${t.border};
  color: ${t.text}; cursor: pointer; font-size: 14px; transition: all 0.2s ease;
}
.mc-correct { background: rgba(77,214,160,0.2) !important; border-color: #4dd6a0 !important; }
.mc-wrong { background: rgba(255,90,90,0.18) !important; border-color: #ff6b6b !important; }

.order-built { min-height: 48px; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px dashed ${t.border}; font-size: 17px; margin-bottom: 12px; }
.order-pool { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.order-chip { padding: 9px 14px; border-radius: 100px; border: 1px solid ${t.accent}66; background: ${t.accent}14; color: ${t.text}; font-size: 14px; cursor: pointer; }
.order-chip.used { opacity: 0.25; }

.story-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: ${t.accent}; }
.story-text { font-size: 16px; line-height: 1.75; margin-bottom: 14px; }
.story-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.theme-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.chip { padding: 6px 12px; border-radius: 100px; border: 1px solid ${t.border}; background: rgba(255,255,255,0.03); color: ${t.sub}; font-size: 12px; cursor: pointer; }
.chip-active { background: ${t.accent}22; border-color: ${t.accent}; color: ${t.text}; }
.curiosity-badge { display: inline-block; font-size: 11px; padding: 3px 11px; border-radius: 100px; background: ${t.accent2}22; color: ${t.accent2}; margin-bottom: 10px; font-weight: 700; font-family: 'Segoe UI', sans-serif; }
.curiosity-question { font-size: 15px; font-weight: 700; margin-bottom: 14px; color: ${t.accent}; }

.loading-card { display: flex; flex-direction: column; gap: 14px; min-height: 150px; justify-content: center; }
.skeleton-lines { display: flex; flex-direction: column; gap: 10px; }
.skel { height: 14px; border-radius: 7px; background: rgba(255,255,255,0.12); animation: skelPulse 1.4s ease infinite; }
.loading-text { color: ${t.sub}; font-size: 13px; text-align: center; font-family: 'Segoe UI', sans-serif; }

.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  padding: 10px 22px; border-radius: 100px; font-weight: 800; font-size: 14px; z-index: 50;
  font-family: 'Segoe UI', sans-serif;
}
.toast-ok { background: #4dd6a0; color: #06281c; }
.toast-bad { background: #ff6b6b; color: #350808; }

.badge-toast {
  position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
  background: linear-gradient(135deg, ${t.accent}ee, ${t.accent2}ee); color: #0a0d16;
  padding: 12px 18px; border-radius: 16px; display: flex; gap: 10px; align-items: center;
  font-size: 13px; z-index: 65; box-shadow: 0 10px 40px rgba(0,0,0,0.5); font-family: 'Segoe UI', sans-serif;
}
.badge-toast-emoji { font-size: 26px; }

.celebrate-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.72); display: flex; align-items: center; justify-content: center; z-index: 60; padding: 20px; }
.celebrate-card { background: rgba(14,18,30,0.96); border: 1px solid ${t.accent}77; border-radius: 24px; padding: 28px 34px; text-align: center; max-width: 340px; width: 100%; }
.celebrate-emoji { font-size: 36px; margin-bottom: 8px; }
.celebrate-title { font-size: 22px; font-weight: 800; }
.celebrate-sub { font-size: 13px; color: ${t.accent}; margin-top: 4px; font-family: 'Segoe UI', sans-serif; }

.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; font-family: 'Segoe UI', sans-serif; }
.summary-grid > div { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 10px; display: flex; flex-direction: column; }
.summary-grid b { font-size: 20px; }
.summary-grid span { font-size: 11px; color: ${t.sub}; }
.summary-fab {
  position: fixed; bottom: 20px; right: 16px; z-index: 45;
  background: ${t.accent}; color: #0a0d16; border: none; border-radius: 100px;
  padding: 10px 16px; font-weight: 800; font-size: 12px; cursor: pointer;
  box-shadow: 0 8px 26px ${t.accent}55; font-family: 'Segoe UI', sans-serif;
}

.cefr-estimate { margin-top: 10px; font-size: 14px; color: ${t.accent}; font-family: 'Segoe UI', sans-serif; }
.stat-line { margin-top: 8px; font-size: 12px; color: ${t.sub}; font-family: 'Segoe UI', sans-serif; }

.heatmap-cal { display: grid; grid-template-columns: repeat(14, 1fr); gap: 4px; }
.cal-cell { aspect-ratio: 1; border-radius: 4px; }

.heat-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-family: 'Segoe UI', sans-serif; }
.heat-label { width: 96px; font-size: 12px; color: ${t.sub}; }
.heat-bar-track { flex: 1; height: 8px; background: rgba(255,255,255,0.07); border-radius: 5px; overflow: hidden; }
.heat-bar { height: 100%; border-radius: 5px; transition: width 0.5s ease; }
.heat-pct { width: 38px; font-size: 12px; font-weight: 700; text-align: right; }

.weak-list { display: flex; flex-direction: column; gap: 7px; font-family: 'Segoe UI', sans-serif; }
.weak-item { font-size: 14px; }

.badge-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-family: 'Segoe UI', sans-serif; }
.badge-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 4px;
  border-radius: 12px; border: 1px solid ${t.border}; background: rgba(255,255,255,0.03);
  opacity: 0.32; filter: grayscale(0.8); text-align: center;
}
.badge-item.earned { opacity: 1; filter: none; border-color: ${t.accent}66; background: ${t.accent}10; }
.badge-emoji { font-size: 22px; }
.badge-name { font-size: 10px; font-weight: 700; }

@media (min-width: 720px) {
  .app { max-width: 720px; margin: 0 auto; }
  .tabs { grid-template-columns: repeat(8, 1fr); }
}
@media (max-width: 380px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .header h1 { font-size: 24px; }
  .tabs { grid-template-columns: repeat(4, 1fr); }
}
`;
}
