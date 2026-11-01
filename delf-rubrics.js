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
    C("phono","Pronunciation and intonation",3,"Clear, natural intonation.") ] }
};
