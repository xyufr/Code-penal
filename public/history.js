// Simplified milestones in the history of the French Penal Code, shown on the start page.
// {count} and {snapshot} are filled in from the loaded corpus.
const history = {
fr: {
 title:'Deux siècles de droit pénal codifié',
 lead:'Le Code pénal en vigueur date de 1994, mais il s’inscrit dans une histoire ouverte par la Révolution. Voici ses principales étapes.',
 items:[
  ['1791','Le premier Code pénal','Adopté par l’Assemblée constituante à l’automne 1791, il traduit le principe de légalité des délits et des peines proclamé par la Déclaration des droits de l’homme et du citoyen de 1789, avec des peines fixées par la loi.'],
  ['1810','Le Code pénal napoléonien','Promulgué en 1810 et entré en vigueur le 1er janvier 1811, il répartit les infractions en crimes, délits et contraventions. Il reste le socle du droit pénal français pendant près de deux siècles.'],
  ['1832','Une première grande réforme','La loi du 28 avril 1832 généralise les circonstances atténuantes et supprime plusieurs peines corporelles.'],
  ['1981','L’abolition de la peine de mort','La loi du 9 octobre 1981 abolit la peine de mort en France.'],
  ['1992','Le nouveau Code pénal','Quatre lois du 22 juillet 1992 adoptent les livres I à IV du nouveau code. La partie réglementaire suit avec le décret du 29 mars 1993.'],
  ['1994','Entrée en vigueur','Le nouveau Code pénal s’applique depuis le 1er mars 1994. Il consacre notamment la responsabilité pénale des personnes morales et réprime les crimes contre l’humanité.'],
  ['2007','L’abolition dans la Constitution','La révision constitutionnelle du 23 février 2007 inscrit à l’article 66-1 que « nul ne peut être condamné à la peine de mort ».'],
  ['2010','Les crimes de guerre','La loi du 9 août 2010 adapte le droit français au Statut de la Cour pénale internationale et crée un livre IV bis consacré aux crimes et délits de guerre.'],
  ['Aujourd’hui','Un code régulièrement modifié','Le code est modifié plusieurs fois par an. Cette édition reproduit les {count} articles en vigueur au {snapshot}.'],
 ],
 note:'Repères simplifiés, à visée pédagogique. Pour l’état du droit applicable, consultez Légifrance.',
},
zh: {
 title:'两个世纪的刑法法典化历程',
 lead:'现行《刑法典》自 1994 年起施行，但它的历史始于法国大革命。以下是法国刑法典的主要发展阶段。',
 items:[
  ['1791','第一部刑法典','1791 年秋由制宪议会通过，体现了 1789 年《人权和公民权利宣言》确立的罪刑法定原则，刑罚由法律明确规定。'],
  ['1810','拿破仑刑法典','1810 年颁布，1811 年 1 月 1 日施行，将刑事违法行为分为重罪、轻罪和违警罪三类。此后近两个世纪，它一直是法国刑法的基础。'],
  ['1832','第一次重大改革','1832 年 4 月 28 日的法律普遍确立了减轻情节，并废除了若干肉刑。'],
  ['1981','废除死刑','1981 年 10 月 9 日的法律在法国废除了死刑。'],
  ['1992','新刑法典','1992 年 7 月 22 日的四部法律通过了新法典的第一卷至第四卷，法规部分随后由 1993 年 3 月 29 日的政令制定。'],
  ['1994','新法典施行','新《刑法典》自 1994 年 3 月 1 日起施行，确立了法人的刑事责任，并规定了危害人类罪。'],
  ['2007','废除死刑入宪','2007 年 2 月 23 日的修宪在宪法第 66-1 条中写明：“任何人不得被判处死刑。”'],
  ['2010','战争罪','2010 年 8 月 9 日的法律使法国法律与《国际刑事法院规约》相衔接，并新增第四卷之一，规定战争重罪与战争轻罪。'],
  ['今天','持续修订的法典','法典每年都会多次修订。本版本收录 {snapshot} 有效的 {count} 条法条。'],
 ],
 note:'以上为便于理解的简要梳理。现行法律以 Légifrance 为准。',
},
en: {
 title:'Two centuries of codified criminal law',
 lead:'The Penal Code in force dates from 1994, but its history begins with the Revolution. These are its main milestones.',
 items:[
  ['1791','The first Penal Code','Adopted by the Constituent Assembly in autumn 1791, it gave effect to the principle that offences and penalties must be defined by law, proclaimed in the 1789 Declaration of the Rights of Man and of the Citizen, with penalties fixed by statute.'],
  ['1810','The Napoleonic Penal Code','Promulgated in 1810 and in force from 1 January 1811, it divided offences into felonies, misdemeanours and petty offences. It remained the foundation of French criminal law for almost two centuries.'],
  ['1832','A first major reform','The Law of 28 April 1832 extended extenuating circumstances to all cases and abolished several corporal punishments.'],
  ['1981','Abolition of the death penalty','The Law of 9 October 1981 abolished the death penalty in France.'],
  ['1992','The new Penal Code','Four laws of 22 July 1992 adopted Books I to IV of the new code. The regulatory part followed with the decree of 29 March 1993.'],
  ['1994','Entry into force','The new Penal Code has applied since 1 March 1994. Among other things, it established the criminal liability of legal persons and made crimes against humanity punishable.'],
  ['2007','Abolition in the Constitution','The constitutional amendment of 23 February 2007 wrote into Article 66-1 that no one may be sentenced to death.'],
  ['2010','War crimes','The Law of 9 August 2010 aligned French law with the Statute of the International Criminal Court and created Book IV bis on war crimes and war misdemeanours.'],
  ['Today','A code amended regularly','The code is amended several times a year. This edition reproduces the {count} articles in force on {snapshot}.'],
 ],
 note:'Simplified milestones for orientation. Check Légifrance for the law currently in force.',
},
};
export default history;
