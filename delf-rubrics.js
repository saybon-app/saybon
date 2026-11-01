// Rubrics modelled on the official DELF assessment grids (criteria families per level). Weights are SayBon's own.
const C = (k, l, max, d) => ({ k, l, max, d });
module.exports = {
  "pe-a1-form": { kind:"pe", level:"a1", label:"Form", criteria:[
    C("consigne","Task completed (all fields)",4,"Every field is filled with a plausible, correctly placed piece of information."),
    C("ortho","Spelling of words and names",2,"Words copied or written with mostly correct spelling; capital letters for names.") ] },
  "pe-a1": { kind:"pe", level:"a1", label:"Short message", criteria:[
    C("consigne","Task and situation respected",4,"Message fits the situation, gives the requested information, right register (tu/vous)."),
    C("lexique","Vocabulary",3,"Very basic, familiar words; limited but sufficient for the task."),
    C("morpho","Simple structures",4,"Simple sentences: subject-verb agreement, basic present tense, articles."),
    C("ortho","Spelling",3,"Common words spelled correctly; some errors tolerated.") ] },
  "pe-a2": { kind:"pe", level:"a2", label:"Short text", criteria:[
    C("consigne","Task respected (length, situation, register)",4,"Right type of text, right addressee, about the required length."),
    C("informer","Giving information / telling events",4,"Clear description of events or request; ideas understandable."),
    C("lexique","Vocabulary",4,"Everyday vocabulary adequate; some repetition acceptable."),
    C("morpho","Grammar",4,"Present, passe compose, futur proche mostly controlled; frequent errors must not block meaning."),
    C("ortho","Spelling",3,"Familiar words spelled correctly."),
    C("coherence","Linking of ideas",2,"Simple connectors (et, mais, parce que, ensuite).") ] },
  "pe-b1": { kind:"pe", level:"b1", label:"Essay / letter", criteria:[
    C("consigne","Task and length respected",3,"Right text type, 160+ words, addressee and register respected."),
    C("argument","Giving opinion and arguments",4,"Clear point of view with reasons and examples."),
    C("coherence","Organisation and cohesion",4,"Paragraphs, linking words, logical progression."),
    C("lexique","Vocabulary range and control",4,"Good range for familiar topics; occasional circumlocution."),
    C("morpho","Grammar control",4,"Good control of common structures; errors do not impede understanding."),
    C("ortho","Spelling and punctuation",3,"Mostly accurate spelling and punctuation.") ] },
  "pe-b2": { kind:"pe", level:"b2", label:"Argued text", criteria:[
    C("consigne","Task, genre and length respected",3,"Right genre (formal letter, article, contribution), 250+ words."),
    C("argument","Developing a reasoned argument",5,"Thesis, structured arguments, examples, counter-argument and conclusion."),
    C("coherence","Organisation and cohesion",4,"Clear plan, varied connectors, paragraphing."),
    C("lexique","Vocabulary range and precision",4,"Wide vocabulary, precise and varied, few lapses."),
    C("morpho","Grammatical accuracy and complexity",5,"Complex structures (subjunctive, relative, passive) used with good control."),
    C("ortho","Spelling and punctuation",2,"Few errors.") ] },
  "po-a11": { kind:"po", level:"a11", label:"Oral (Prim A1.1)", criteria:[
    C("interaction","Understanding and answering",8,"Understands simple questions, answers with a word or a short phrase, may need repetition."),
    C("lexique","Vocabulary",6,"A few words for self, family, home, likes."),
    C("morpho","Simple structures",5,"Isolated words and memorised phrases."),
    C("phono","Pronunciation",6,"Understandable with effort; some sounds approximated.") ] },
  "po-a1": { kind:"po", level:"a1", label:"Oral A1", criteria:[
    C("interaction","Task and interaction",8,"Introduces self, answers and asks simple questions, plays the role in a simple exchange."),
    C("lexique","Vocabulary",5,"Basic words for familiar topics."),
    C("morpho","Grammar",6,"Simple sentences, present tense, basic question forms."),
    C("phono","Pronunciation",6,"Understandable, even with a foreign accent.") ] },
  "po-a2": { kind:"po", level:"a2", label:"Oral A2", criteria:[
    C("interaction","Task and interaction",6,"Handles the interview, a short monologue and a simple role-play."),
    C("monologue","Describing and telling",5,"Simple description or story with linked sentences."),
    C("lexique","Vocabulary",5,"Everyday vocabulary adequate."),
    C("morpho","Grammar",5,"Present, passe compose, futur proche; errors do not block meaning."),
    C("phono","Pronunciation and fluency",4,"Clear enough; pauses for planning are normal.") ] },
  "po-b1": { kind:"po", level:"b1", label:"Oral B1", criteria:[
    C("interaction","Interaction and task",5,"Keeps the exchange going, reacts, asks questions."),
    C("point_de_vue","Expressing and justifying a point of view",6,"Gives opinion, reasons and examples on a document."),
    C("lexique","Vocabulary",4,"Adequate range and control."),
    C("morpho","Grammar",4,"Good control of common structures."),
    C("coherence","Fluency and coherence",3,"Speaks with fair ease; links ideas."),
    C("phono","Pronunciation",3,"Clear and intelligible.") ] },
  "po-b2": { kind:"po", level:"b2", label:"Oral B2", criteria:[
    C("presentation","Presenting and arguing a point of view",6,"Clear thesis, structure, arguments with examples; introduction and conclusion."),
    C("interaction","Debate and reactions",5,"Answers objections, defends and nuances the position."),
    C("lexique","Vocabulary",4,"Wide, precise vocabulary."),
    C("morpho","Grammar",4,"Varied, accurate structures including complex ones."),
    C("coherence","Fluency and cohesion",3,"Speaks fluently with natural connectors."),
    C("phono","Pronunciation and intonation",3,"Clear, natural intonation.") ] },
  "pe-c1-synth": { kind:"pe", level:"c1", label:"Synthèse de documents", criteria:[
    C("consigne","Task respected (about 160-180 words, neutral, no personal opinion, documents all used)",3,"Right length, impersonal and neutral, no copying of sentences, all documents taken into account."),
    C("selection","Selection, hierarchy and reformulation of the information",5,"Main ideas selected and ranked; information reformulated in own words, not copied; no invented content."),
    C("coherence","Organisation, coherence and cohesion",3,"Clear plan, logical progression, varied connectors, paragraphs."),
    C("lexique","Vocabulary",2,"Precise abstract vocabulary, paraphrase of the documents' terms."),
    C("morpho","Grammar and spelling",2,"Complex structures controlled; rare slips only.") ] },
  "pe-c1-essay": { kind:"pe", level:"c1", label:"Essai argumenté", criteria:[
    C("consigne","Task respected (250+ words, argued, personal position, relevant to the subject)",3,"Takes a clear position on the question and answers it throughout."),
    C("argumentation","Argumentation and examples",4,"Developed arguments, concrete examples, counter-argument considered, convincing conclusion."),
    C("coherence","Organisation, coherence and cohesion",3,"Clear introduction, development and conclusion; fluent linking of ideas."),
    C("lexique","Range and precision of vocabulary",3,"Wide, precise, idiomatic vocabulary suited to an argumentative text."),
    C("morpho","Grammar, syntax and spelling",3,"Wide range of complex structures (subjunctive, concession, hypothesis) accurately used.") ] },
  "pe-c2": { kind:"pe", level:"c2", label:"Texte structuré à partir d'un dossier", criteria:[
    C("consigne","Task respected (text type, addressee, purpose, length)",4,"Writes the requested type of text (article, editorial, report or speech) for the right readership and purpose."),
    C("information","Use of the dossier: selection, synthesis and reformulation",6,"Draws on all the documents, ranks and combines the information, reformulates, never copies; accurate."),
    C("argumentation","Point of view and argumentation",5,"Developed, nuanced and original argumentation; counter-arguments; clear stance."),
    C("coherence","Structure, coherence and cohesion",5,"Sophisticated plan, subtle cohesion, effective introduction and conclusion."),
    C("socio","Register and style",3,"Register matched to the text type and readers; stylistic control (rhetorical devices, nuance)."),
    C("lexique","Vocabulary",4,"Very wide, precise and idiomatic vocabulary; fine shades of meaning."),
    C("morpho","Grammar, syntax and spelling",3,"Consistently accurate, complex syntax; errors are rare and minor.") ] },
  "po-c1": { kind:"po", level:"c1", label:"Exposé et débat", criteria:[
    C("expose","Exposé: identifies the issue, structures, argues (about 10 min worth of content)",6,"Clear problématique, structured plan, developed arguments and a conclusion."),
    C("debat","Debate: reacting, defending a view, nuance",5,"Replies precisely to the examiner, defends and nuances a position, picks up counter-arguments."),
    C("lexique","Vocabulary",4,"Wide and precise, abstract terms and idioms."),
    C("morpho","Grammar and syntax",4,"Complex structures well controlled."),
    C("coherence","Fluency and cohesion",3,"Speaks fluently and spontaneously, natural connectors."),
    C("phono","Pronunciation and intonation",3,"Clear, natural, expressive.") ] },
  "po-c2": { kind:"po", level:"c2", label:"Synthèse orale, point de vue et débat", criteria:[
    C("synthese","Summary of the sound document: accuracy and conciseness",5,"Faithful, well-ranked summary of the content, no distortion."),
    C("pointdevue","Developing a point of view on the issue raised",6,"Original, structured argued position that goes beyond the document."),
    C("debat","Debate with the jury: reaction, defence, nuance",5,"Spontaneous, precise replies; defends and refines arguments; handles objections."),
    C("lexique","Vocabulary",3,"Very wide, precise and idiomatic; fine shades of meaning."),
    C("morpho","Grammar and syntax",3,"Consistently accurate with complex sentences."),
    C("socio","Register and style",1,"Register and rhetoric suited to a formal discussion."),
    C("phono","Fluency, pronunciation and intonation",2,"Natural, fluent, expressive delivery.") ] }
};
