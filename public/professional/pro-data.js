/* French for Professionals: field content.
   words: [French, English, example French, example English]
   plays: turns are {o:[French, English]} for the other person, or {y:[goal in English, correct French, wrong 1, wrong 2]} for the learner. */
window.PRO_DATA = [
{ id:"banking", name:"Banking and finance", blurb:"Accounts, transfers, loans and exchange rates", icon:"bank",
  words:[
   ["un compte","account","Je voudrais ouvrir un compte.","I would like to open an account."],
   ["un virement","transfer","Le virement arrive demain.","The transfer arrives tomorrow."],
   ["un prêt","loan","Nous étudions votre demande de prêt.","We are reviewing your loan request."],
   ["le taux d'intérêt","interest rate","Le taux d'intérêt est fixe.","The interest rate is fixed."],
   ["le solde","balance","Quel est le solde de mon compte ?","What is my account balance?"],
   ["un relevé","statement","Je vous envoie le relevé par e-mail.","I am sending you the statement by email."],
   ["une pièce d'identité","proof of ID","Merci de présenter une pièce d'identité.","Please show proof of ID."],
   ["un justificatif de domicile","proof of address","Il me faut un justificatif de domicile.","I need a proof of address."],
   ["les frais","fees","Quels sont les frais de transfert ?","What are the transfer fees?"],
   ["le taux de change","exchange rate","Le taux de change varie chaque jour.","The exchange rate changes every day."],
   ["un guichet","counter, teller window","Rendez-vous au guichet numéro deux.","Go to counter number two."],
   ["verser","to pay in, to deposit","Je souhaite verser de l'argent sur mon compte.","I want to pay money into my account."]
  ],
  plays:[
   { title:"Opening an account", setting:"You are at a bank branch. The employee speaks French.", turns:[
     {o:["Bonjour, que puis-je faire pour vous ?","Hello, how can I help you?"]},
     {y:["Say you would like to open an account.","Bonjour, je voudrais ouvrir un compte.","Bonjour, je voudrais fermer un compte.","Au revoir, merci beaucoup."]},
     {o:["Très bien. Avez-vous une pièce d'identité et un justificatif de domicile ?","Very good. Do you have proof of ID and proof of address?"]},
     {y:["Say yes, here is your passport and an electricity bill.","Oui, voici mon passeport et ma facture d'électricité.","Non, je n'ai pas de compte en banque.","Oui, le taux d'intérêt est fixe."]},
     {o:["Parfait. Quel type de compte souhaitez-vous ?","Perfect. What type of account would you like?"]},
     {y:["Ask for a current account.","Un compte courant, s'il vous plaît.","Un prêt pour la maison.","Un virement vers Dakar."]},
     {o:["Voilà, votre compte est ouvert. Autre chose ?","There, your account is open. Anything else?"]},
     {y:["Say yes, and ask what the transfer fees are.","Oui, quels sont les frais de virement ?","Non, je voudrais fermer mon compte.","Oui, je suis à découvert."]}
   ]},
   { title:"An international transfer", setting:"You want to send money to a partner in Abidjan.", turns:[
     {o:["Bonjour. Vous souhaitez faire un virement ?","Hello. Would you like to make a transfer?"]},
     {y:["Say yes, a transfer to Abidjan, please.","Oui, un virement vers Abidjan, s'il vous plaît.","Non, je voudrais un prêt de dix ans.","Non, merci, j'ai déjà un compte."]},
     {o:["Quel est le montant, et quelle est la devise ?","What is the amount, and what is the currency?"]},
     {y:["Say five thousand cedis, and ask today's exchange rate.","Cinq mille cedis. Quel est le taux de change aujourd'hui ?","Cinq mille cedis, c'est mon justificatif.","Le guichet est fermé, je reviens demain."]},
     {o:["Les frais sont de vingt cedis. Cela vous convient ?","The fees are twenty cedis. Is that fine with you?"]},
     {y:["Say yes, that is fine, and ask when the transfer will arrive.","Oui, c'est d'accord. Quand le virement arrivera-t-il ?","Non, je ne veux pas de relevé.","Oui, j'ouvre un compte."]},
     {o:["Il arrivera demain. Voici votre reçu.","It will arrive tomorrow. Here is your receipt."]},
     {y:["Thank them and wish them a good day.","Merci beaucoup. Bonne journée !","Je voudrais un prêt.","Je dépose un chèque."]}
   ]}
  ]},
{ id:"logistics", name:"Logistics and customs", blurb:"Shipments, borders, documents and delays", icon:"truck",
  words:[
   ["la douane","customs","La douane contrôle les marchandises.","Customs checks the goods."],
   ["une déclaration en douane","customs declaration","Nous préparons la déclaration en douane.","We are preparing the customs declaration."],
   ["un transitaire","freight forwarder","Notre transitaire s'occupe du transport.","Our freight forwarder handles the transport."],
   ["un conteneur","container","Le conteneur arrive au port demain.","The container arrives at the port tomorrow."],
   ["les marchandises","goods","Les marchandises sont en transit.","The goods are in transit."],
   ["un bordereau de livraison","delivery note","Signez le bordereau de livraison, s'il vous plaît.","Please sign the delivery note."],
   ["une facture commerciale","commercial invoice","Il manque la facture commerciale.","The commercial invoice is missing."],
   ["les droits de douane","customs duties","Les droits de douane sont payés à l'arrivée.","Customs duties are paid on arrival."],
   ["un entrepôt","warehouse","Les palettes sont dans l'entrepôt.","The pallets are in the warehouse."],
   ["un retard","delay","Il y a un retard à la frontière.","There is a delay at the border."],
   ["un chargement","load, shipment","Le chargement part ce soir.","The shipment leaves tonight."],
   ["la frontière","border","Le camion passe la frontière ce matin.","The truck crosses the border this morning."]
  ],
  plays:[
   { title:"At the border post", setting:"Your truck is stopped at a customs post. The officer speaks French.", turns:[
     {o:["Bonjour. Quels documents avez-vous pour ce chargement ?","Hello. What documents do you have for this shipment?"]},
     {y:["Say you have the commercial invoice and the delivery note.","J'ai la facture commerciale et le bordereau de livraison.","J'ai un conteneur dans l'entrepôt.","Je voudrais payer par virement."]},
     {o:["Que transportez-vous exactement ?","What exactly are you transporting?"]},
     {y:["Say you are transporting machine parts.","Je transporte des pièces de machines.","Je travaille dans un entrepôt.","Je suis en retard."]},
     {o:["Il y a des droits de douane à payer. Voulez-vous voir le montant ?","There are customs duties to pay. Would you like to see the amount?"]},
     {y:["Say yes, and ask what the amount of the duties is.","Oui, quel est le montant des droits ?","Oui, le camion est à Accra.","Non, je voudrais un relevé."]},
     {o:["Voilà. Après le paiement, vous pouvez passer.","Here. After payment, you can go through."]},
     {y:["Thank them and ask whether there is a delay today.","Merci. Y a-t-il un retard aujourd'hui ?","Merci. J'ai un compte courant.","Merci. Je voudrais ouvrir le conteneur demain."]}
   ]},
   { title:"Tracking a shipment", setting:"You call a forwarder in Abidjan about your container.", turns:[
     {o:["Allô, ici Koffi, de la société de transit à Abidjan.","Hello, this is Koffi from the forwarding company in Abidjan."]},
     {y:["Greet Koffi and ask where your container is.","Bonjour Koffi. Où est notre conteneur ?","Bonjour Koffi. Je voudrais un prêt.","Au revoir Koffi, bonne nuit."]},
     {o:["Il est au port. Il y a un petit retard.","It is at the port. There is a small delay."]},
     {y:["Ask how long the delay will last.","Combien de temps le retard va-t-il durer ?","Quel est le taux de change ?","Où est le guichet ?"]},
     {o:["Un ou deux jours. Les documents ne sont pas complets.","One or two days. The documents are not complete."]},
     {y:["Ask which document is missing.","Quel document manque ?","Je signe le bordereau.","Je ferme l'entrepôt."]},
     {o:["Il manque la déclaration en douane.","The customs declaration is missing."]},
     {y:["Say you will send the declaration today.","Je vous envoie la déclaration aujourd'hui.","Je vous envoie le conteneur hier.","Je vous remercie, mon compte est ouvert."]}
   ]}
  ]},
{ id:"health", name:"Health", blurb:"Patients, symptoms, prescriptions and emergencies", icon:"cross",
  words:[
   ["un patient","patient","Le patient attend dans la salle d'attente.","The patient is waiting in the waiting room."],
   ["une ordonnance","prescription","Voici votre ordonnance.","Here is your prescription."],
   ["un médicament","medicine","Prenez ce médicament deux fois par jour.","Take this medicine twice a day."],
   ["la fièvre","fever","Vous avez de la fièvre depuis quand ?","How long have you had a fever?"],
   ["une douleur","pain","Où se situe la douleur ?","Where is the pain?"],
   ["une allergie","allergy","Avez-vous une allergie ?","Do you have an allergy?"],
   ["un rendez-vous","appointment","Votre rendez-vous est à dix heures.","Your appointment is at ten o'clock."],
   ["une analyse de sang","blood test","Le médecin demande une analyse de sang.","The doctor is asking for a blood test."],
   ["la tension","blood pressure","Je vais prendre votre tension.","I am going to take your blood pressure."],
   ["un vaccin","vaccine","Le vaccin est gratuit pour les enfants.","The vaccine is free for children."],
   ["respirer","to breathe","Respirez profondément, s'il vous plaît.","Breathe deeply, please."],
   ["une urgence","emergency","C'est une urgence.","It is an emergency."]
  ],
  plays:[
   { title:"Welcoming a patient", setting:"You are a nurse at a clinic. The patient speaks French.", turns:[
     {o:["Bonjour, j'ai de la fièvre et mal à la tête.","Hello, I have a fever and a headache."]},
     {y:["Ask how long they have had the fever.","Depuis quand avez-vous de la fièvre ?","Quel est votre taux de change ?","Voici votre ordonnance."]},
     {o:["Depuis deux jours.","For two days."]},
     {y:["Ask whether they have an allergy to a medicine.","Avez-vous une allergie à un médicament ?","Avez-vous mangé à l'hôtel ?","Où est la frontière ?"]},
     {o:["Non, pas d'allergie.","No, no allergy."]},
     {y:["Say you are going to take their blood pressure.","Je vais prendre votre tension.","Je vais prendre votre rendez-vous.","Je vais vous donner un chèque."]},
     {o:["D'accord. Est-ce grave ?","Okay. Is it serious?"]},
     {y:["Reassure them: no, the doctor will see them in a few minutes.","Non, le médecin va vous voir dans quelques minutes.","Oui, c'est une urgence, partez.","Non, votre solde est positif."]}
   ]},
   { title:"Explaining a prescription", setting:"You are the doctor. A patient asks about a medicine.", turns:[
     {o:["Docteur, comment dois-je prendre ce médicament ?","Doctor, how should I take this medicine?"]},
     {y:["Say take it twice a day, after the meal.","Prenez-le deux fois par jour, après le repas.","Prenez-le hier soir.","Ne le prenez jamais."]},
     {o:["Combien de temps dois-je le prendre ?","How long must I take it?"]},
     {y:["Say for seven days.","Pendant sept jours.","Sept euros.","Dans la salle d'attente."]},
     {o:["Et si la fièvre continue ?","And if the fever continues?"]},
     {y:["Say come back to see you, or call the emergency service.","Revenez me voir ou appelez le service d'urgence.","Ouvrez un compte.","Signez le bordereau."]},
     {o:["Merci, docteur.","Thank you, doctor."]},
     {y:["Say you are welcome, and to take care.","De rien. Soignez-vous bien !","Je voudrais un virement.","Le conteneur arrive demain."]}
   ]}
  ]},
{ id:"hospitality", name:"Hospitality and tourism", blurb:"Reservations, guests, tours and complaints", icon:"bed",
  words:[
   ["une réservation","reservation","J'ai une réservation au nom de Mensah.","I have a reservation under the name Mensah."],
   ["une chambre double","double room","Nous avons une chambre double disponible.","We have a double room available."],
   ["la réception","reception","La réception est ouverte vingt-quatre heures sur vingt-quatre.","Reception is open twenty-four hours a day."],
   ["le petit-déjeuner","breakfast","Le petit-déjeuner est servi à sept heures.","Breakfast is served at seven o'clock."],
   ["la clé","key","Voici la clé de votre chambre.","Here is the key to your room."],
   ["une nuit","night","Vous restez combien de nuits ?","How many nights are you staying?"],
   ["un guide","guide","Notre guide parle français et anglais.","Our guide speaks French and English."],
   ["une excursion","tour, excursion","L'excursion part à neuf heures.","The excursion leaves at nine o'clock."],
   ["l'addition","the bill","L'addition, s'il vous plaît.","The bill, please."],
   ["un menu","menu","Puis-je voir le menu ?","May I see the menu?"],
   ["une réclamation","complaint","Je voudrais faire une réclamation.","I would like to make a complaint."],
   ["un pourboire","tip","Le service est compris, le pourboire est facultatif.","Service is included, the tip is optional."]
  ],
  plays:[
   { title:"Checking a guest in", setting:"You work at hotel reception. A French-speaking guest arrives.", turns:[
     {o:["Bonsoir, j'ai une réservation au nom de Diallo.","Good evening, I have a reservation under the name Diallo."]},
     {y:["Greet the guest and say you are looking for the reservation.","Bonsoir, monsieur. Un instant, je cherche votre réservation.","Bonsoir. Voici l'addition.","Bonsoir. Le petit-déjeuner est fini."]},
     {o:["Pour trois nuits, en chambre double.","For three nights, in a double room."]},
     {y:["Confirm: your double room is ready for three nights.","Très bien, votre chambre double est prête pour trois nuits.","Très bien, votre chambre simple est pour une semaine.","Très bien, voici votre ordonnance."]},
     {o:["À quelle heure est le petit-déjeuner ?","What time is breakfast?"]},
     {y:["Say breakfast is served from seven to ten.","Le petit-déjeuner est servi de sept heures à dix heures.","Le petit-déjeuner est un guide.","Le petit-déjeuner coûte trois nuits."]},
     {o:["Merci. Et la clé ?","Thank you. And the key?"]},
     {y:["Give the key and wish them a good stay.","Voici votre clé. Bon séjour !","Voici votre addition. Au revoir.","Voici votre pourboire, merci."]}
   ]},
   { title:"A tour and a complaint", setting:"You work for a tour desk. A tourist asks questions.", turns:[
     {o:["Bonjour, avez-vous des excursions demain ?","Hello, do you have any tours tomorrow?"]},
     {y:["Say yes, a tour at nine with a French-speaking guide.","Oui, nous avons une excursion à neuf heures avec un guide francophone.","Oui, nous avons une chambre à neuf heures.","Non, la réception est un menu."]},
     {o:["Combien coûte l'excursion ?","How much does the tour cost?"]},
     {y:["Say it costs one hundred and fifty cedis per person.","Elle coûte cent cinquante cedis par personne.","Elle dure trois nuits.","Elle est en chambre double."]},
     {o:["Mon repas était froid hier. Je voudrais faire une réclamation.","My meal was cold yesterday. I would like to make a complaint."]},
     {y:["Apologise and say you will speak to the manager right away.","Je suis désolé. Je vais en parler au responsable tout de suite.","Merci pour le pourboire.","Ce n'est pas mon problème."]},
     {o:["Merci de votre aide.","Thank you for your help."]},
     {y:["Say you are welcome and wish them a good day.","Je vous en prie. Bonne journée !","Je ne comprends pas votre réservation.","Votre compte est à découvert."]}
   ]}
  ]},
{ id:"defence", name:"Military and security", blurb:"Patrols, checkpoints, briefings and reports", icon:"shield",
  words:[
   ["un soldat","soldier","Le soldat garde l'entrée.","The soldier guards the entrance."],
   ["une patrouille","patrol","La patrouille commence à six heures.","The patrol starts at six o'clock."],
   ["un commandant","commander","Le commandant donne les ordres.","The commander gives the orders."],
   ["un ordre","order","Nous exécutons l'ordre immédiatement.","We carry out the order immediately."],
   ["la mission","mission","Notre mission est de protéger la population.","Our mission is to protect the population."],
   ["un poste de contrôle","checkpoint","Le poste de contrôle est à deux kilomètres.","The checkpoint is two kilometres away."],
   ["la sécurité","security, safety","La sécurité du convoi est prioritaire.","The safety of the convoy is the priority."],
   ["un convoi","convoy","Le convoi part à l'aube.","The convoy leaves at dawn."],
   ["un rapport","report","J'envoie le rapport au commandant.","I am sending the report to the commander."],
   ["le maintien de la paix","peacekeeping","Nous participons à une mission de maintien de la paix.","We are taking part in a peacekeeping mission."],
   ["un danger","danger","Il y a un danger sur la route.","There is a danger on the road."],
   ["la radio","radio","Répétez sur la radio, s'il vous plaît.","Repeat it on the radio, please."]
  ],
  plays:[
   { title:"Patrol briefing", setting:"You are briefed by a Francophone captain before a joint patrol.", turns:[
     {o:["Bonjour. La patrouille part à six heures. Êtes-vous prêt ?","Hello. The patrol leaves at six. Are you ready?"]},
     {y:["Say yes, sir, you are ready.","Oui, mon commandant, nous sommes prêts.","Non, je voudrais un petit-déjeuner.","Oui, j'ai une réservation."]},
     {o:["Notre mission est de sécuriser le convoi. Avez-vous des questions ?","Our mission is to secure the convoy. Do you have any questions?"]},
     {y:["Ask what the route is, and where the checkpoint is.","Quel est l'itinéraire, et où est le poste de contrôle ?","Combien coûte la chambre ?","Quel est le taux d'intérêt ?"]},
     {o:["L'itinéraire passe par le village, puis le pont.","The route goes through the village, then the bridge."]},
     {y:["Say understood, and ask what to do in case of danger.","Compris. Que faisons-nous en cas de danger ?","Compris. Je voudrais une ordonnance.","Compris. L'addition, s'il vous plaît."]},
     {o:["Vous informez le commandant par radio.","You inform the commander by radio."]},
     {y:["Say received, and that you will send a report at the end.","Bien reçu. J'enverrai un rapport à la fin.","Bien reçu. Je mange à la réception.","Bien reçu. Je ne parle pas."]}
   ]},
   { title:"At a checkpoint", setting:"You are stopped at a checkpoint. The soldier speaks French.", turns:[
     {o:["Arrêtez-vous, s'il vous plaît. Présentez vos papiers.","Stop, please. Show your papers."]},
     {y:["Say here are your papers and your mission order.","Voici mes papiers et mon ordre de mission.","Voici mon menu.","Voici mon vaccin."]},
     {o:["Où allez-vous ?","Where are you going?"]},
     {y:["Say you are going to the base for a peacekeeping mission.","Nous allons à la base, pour une mission de maintien de la paix.","Nous allons à la réception.","Nous allons à la banque."]},
     {o:["Combien de véhicules ?","How many vehicles?"]},
     {y:["Say three vehicles, ten soldiers.","Trois véhicules, dix soldats.","Trois nuits, dix cedis.","Un patient, une ordonnance."]},
     {o:["Très bien, vous pouvez passer. Bonne route.","Very good, you may pass. Safe travels."]},
     {y:["Thank them and wish them a good day.","Merci, bonne journée.","Voici l'addition.","Je voudrais faire une réclamation."]}
   ]}
  ]},
{ id:"business", name:"General business", blurb:"Meetings, quotes, contracts and invoices", icon:"briefcase",
  words:[
   ["une réunion","meeting","La réunion commence à neuf heures.","The meeting starts at nine o'clock."],
   ["un client","client","Le client attend notre offre.","The client is waiting for our offer."],
   ["un devis","quote","Je vous envoie un devis aujourd'hui.","I am sending you a quote today."],
   ["une facture","invoice","La facture est payable sous trente jours.","The invoice is payable within thirty days."],
   ["un contrat","contract","Nous signons le contrat demain.","We are signing the contract tomorrow."],
   ["un délai","deadline, lead time","Quel est le délai de livraison ?","What is the delivery lead time?"],
   ["un fournisseur","supplier","Notre fournisseur est à Lomé.","Our supplier is in Lomé."],
   ["un budget","budget","Le budget est limité.","The budget is limited."],
   ["une proposition","proposal","Voici notre proposition.","Here is our proposal."],
   ["négocier","to negotiate","Nous voulons négocier le prix.","We want to negotiate the price."],
   ["un ordre du jour","agenda","L'ordre du jour est dans votre e-mail.","The agenda is in your email."],
   ["un compte rendu","minutes, report","Je rédige le compte rendu.","I am writing the minutes."]
  ],
  plays:[
   { title:"A meeting with a client", setting:"You present an offer to a French-speaking client.", turns:[
     {o:["Bonjour, merci de nous recevoir. Parlons de votre proposition.","Hello, thank you for having us. Let us talk about your proposal."]},
     {y:["Say with pleasure, and here is the agenda of the meeting.","Bonjour, avec plaisir. Voici l'ordre du jour de la réunion.","Bonjour. Voici mon ordonnance.","Bonjour. Votre chambre est prête."]},
     {o:["Quel est le prix, et le délai de livraison ?","What is the price, and the delivery lead time?"]},
     {y:["Say the price is in the quote, and the lead time is two weeks.","Le prix est dans le devis, et le délai est de deux semaines.","Le prix est une réunion.","Le délai est un fournisseur."]},
     {o:["Le budget est limité. Pouvons-nous négocier ?","The budget is limited. Can we negotiate?"]},
     {y:["Say yes, you can discuss the price.","Oui, nous pouvons discuter du prix.","Non, je ne parle pas de budget.","Oui, ouvrons un compte."]},
     {o:["Très bien. Pouvez-vous envoyer le contrat ?","Very good. Can you send the contract?"]},
     {y:["Say of course, you will send it today with the minutes.","Bien sûr, je vous l'envoie aujourd'hui avec le compte rendu.","Bien sûr, je vous l'envoie hier.","Non, le contrat est à l'hôtel."]}
   ]},
   { title:"Chasing an invoice", setting:"You phone a supplier about a late invoice.", turns:[
     {o:["Allô, ici le service commercial. Je vous écoute.","Hello, this is the sales department. I am listening."]},
     {y:["Say you are calling about invoice number 214.","Bonjour, j'appelle au sujet de la facture numéro 214.","Bonjour, je voudrais une chambre.","Bonjour, le soldat est prêt."]},
     {o:["Un instant... Oui, la facture est en retard.","One moment... Yes, the invoice is late."]},
     {y:["Apologise and say the payment goes out this week.","Je m'excuse. Le paiement part cette semaine.","Je m'excuse. Je suis le client de l'hôtel.","Je m'excuse. Le conteneur est un menu."]},
     {o:["Pouvez-vous confirmer par e-mail ?","Can you confirm by email?"]},
     {y:["Say yes, you will send a confirmation today.","Oui, je vous envoie une confirmation aujourd'hui.","Oui, je signe le bordereau de la chambre.","Non, je ne confirme pas ma réservation."]},
     {o:["Merci. Bonne journée.","Thank you. Have a good day."]},
     {y:["Say thank you, you too, goodbye.","Merci, à vous aussi. Au revoir !","Au revoir, je voudrais un prêt.","Merci, l'addition s'il vous plaît."]}
   ]}
  ]}
];
