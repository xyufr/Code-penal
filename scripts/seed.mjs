// French legislative texts: Légifrance. English and Chinese: unofficial AI-assisted translations.
const t = (fr, zh, en) => ({ fr, zh, en });
export const groups = [
 {id:'principles',book:1,title:t('Les principes généraux','基本原则','General principles'),range:'111-1 – 111-5'},
 {id:'liability',book:1,title:t('La responsabilité pénale','刑事责任','Criminal liability'),range:'121-1 – 121-7'},
 {id:'defences',book:1,title:t('Les causes d’irresponsabilité','免责事由','Grounds excluding liability'),range:'122-2 – 122-7'},
 {id:'life',book:2,title:t('Les atteintes à la vie','侵犯生命','Offences against life'),range:'221-1'},
 {id:'theft',book:3,title:t('Le vol','盗窃','Theft'),range:'311-1 – 311-3'}
];
export const books = [
 {id:1,roman:'I',title:t('Dispositions générales','总则','General provisions')},
 {id:2,roman:'II',title:t('Crimes et délits contre les personnes','侵害人身的重罪与轻罪','Offences against persons')},
 {id:3,roman:'III',title:t('Crimes et délits contre les biens','侵害财产的重罪与轻罪','Offences against property')}
];
const sections = {principles:'LEGISCTA000006149814',liability:'LEGISCTA000006149817',defences:'LEGISCTA000006149818',theft:'LEGISCTA000006149833'};
const rows = [
['111-1','principles',t('La classification des infractions','犯罪的分类','Classification of offences'),t(
['Les infractions pénales sont classées, suivant leur gravité, en crimes, délits et contraventions.'],
['刑事违法行为根据其严重程度分为重罪、轻罪和违警罪。'],
['Criminal offences are classified according to their seriousness as crimes, délits and contraventions.'])],
['111-2','principles',t('La loi et le règlement','法律与行政法规','Statutes and regulations'),t(
['La loi détermine les crimes et délits et fixe les peines applicables à leurs auteurs.','Le règlement détermine les contraventions et fixe, dans les limites et selon les distinctions établies par la loi, les peines applicables aux contrevenants.'],
['法律规定重罪和轻罪，并确定适用于其行为人的刑罚。','行政法规规定违警罪，并在法律所确定的范围内、依其所作的区分，确定适用于违法者的刑罚。'],
['Statute defines crimes and délits and determines the penalties applicable to their perpetrators.','Regulations define contraventions and determine the penalties applicable to offenders, within the limits and according to the distinctions established by statute.'])],
['111-3','principles',t('La légalité des infractions et des peines','罪刑法定原则','Legality of offences and penalties'),t(
["Nul ne peut être puni pour un crime ou pour un délit dont les éléments ne sont pas définis par la loi, ou pour une contravention dont les éléments ne sont pas définis par le règlement.","Nul ne peut être puni d'une peine qui n'est pas prévue par la loi, si l'infraction est un crime ou un délit, ou par le règlement, si l'infraction est une contravention."],
['对于法律未规定其构成要件的重罪或轻罪，或者行政法规未规定其构成要件的违警罪，任何人不得受到处罚。','对于重罪或轻罪，任何人不得被处以法律未规定的刑罚；对于违警罪，任何人不得被处以行政法规未规定的刑罚。'],
['No one may be punished for a crime or délit whose constituent elements are not defined by statute, or for a contravention whose constituent elements are not defined by regulations.','No one may receive a penalty that is not prescribed by statute where the offence is a crime or délit, or by regulations where the offence is a contravention.'])],
['111-4','principles',t('L’interprétation stricte','严格解释原则','Strict interpretation'),t(
["La loi pénale est d'interprétation stricte."],['刑法应当严格解释。'],['Criminal law must be strictly interpreted.'])],
['111-5','principles',t('Le contrôle des actes administratifs','对行政行为的审查','Review of administrative acts'),t(
["Les juridictions pénales sont compétentes pour interpréter les actes administratifs, réglementaires ou individuels et pour en apprécier la légalité lorsque, de cet examen, dépend la solution du procès pénal qui leur est soumis."],
['当受理的刑事案件之裁判取决于对行政行为的审查时，刑事法院有权解释规范性或个别性行政行为，并审查其合法性。'],
['Criminal courts have jurisdiction to interpret administrative acts, whether regulatory or individual, and to assess their legality where the outcome of the criminal proceedings before them depends on that examination.'])],
['121-1','liability',t('La responsabilité personnelle','个人责任原则','Personal liability'),t(
["Nul n'est responsable pénalement que de son propre fait."],['任何人仅对自己的行为承担刑事责任。'],['No one is criminally liable except for their own conduct.'])],
['121-4','liability',t('L’auteur de l’infraction','犯罪的实行人','The perpetrator'),t(
["Est auteur de l'infraction la personne qui :",'1° Commet les faits incriminés ;','2° Tente de commettre un crime ou, dans les cas prévus par la loi, un délit.'],
['具有下列情形之一的人为犯罪的实行人：','1° 实施被定为犯罪的行为；','2° 实施重罪未遂，或者在法律规定的情形下实施轻罪未遂。'],
['The perpetrator of an offence is a person who:','1° Commits the criminalised acts;','2° Attempts to commit a crime or, in the cases provided for by statute, a délit.'])],
['121-5','liability',t('La tentative','犯罪未遂','Attempt'),t(
["La tentative est constituée dès lors que, manifestée par un commencement d'exécution, elle n'a été suspendue ou n'a manqué son effet qu'en raison de circonstances indépendantes de la volonté de son auteur."],
['行为人已经着手实行犯罪，仅因其意志以外的情形而中止实行或者未能得逞的，构成犯罪未遂。'],
['An attempt is constituted where a commencement of execution has occurred and the attempt was interrupted or failed to achieve its effect only because of circumstances independent of the perpetrator’s will.'])],
['121-6','liability',t('La peine du complice','共犯的处罚','Punishment of an accomplice'),t(
["Sera puni comme auteur le complice de l'infraction, au sens de l'article 121-7."],['第121-7条所指的犯罪共犯，按实行人处罚。'],['An accomplice to an offence, within the meaning of Article 121-7, is punishable as a perpetrator.'])],
['121-7','liability',t('La complicité','共犯','Complicity'),t(
["Est complice d'un crime ou d'un délit la personne qui sciemment, par aide ou assistance, en a facilité la préparation ou la consommation.","Est également complice la personne qui par don, promesse, menace, ordre, abus d'autorité ou de pouvoir aura provoqué à une infraction ou donné des instructions pour la commettre."],
['明知而以帮助或协助的方式，为重罪或轻罪的准备或实施提供便利的人，为该犯罪的共犯。','以赠与、承诺、威胁、命令、滥用权威或权力的方式教唆犯罪，或者为实施犯罪提供指示的人，亦为共犯。'],
['A person who knowingly facilitates the preparation or commission of a crime or délit through aid or assistance is an accomplice to that offence.','A person who induces an offence by a gift, promise, threat, order, or abuse of authority or power, or gives instructions for its commission, is also an accomplice.'])],
['122-2','defences',t('La contrainte','不可抗拒的强制','Irresistible force or compulsion'),t(
["N'est pas pénalement responsable la personne qui a agi sous l'empire d'une force ou d'une contrainte à laquelle elle n'a pu résister."],
['在其无法抗拒的力量或强制作用下实施行为的人，不承担刑事责任。'],
['A person who acts under the influence of a force or compulsion which they could not resist is not criminally liable.'])],
['122-3','defences',t('L’erreur sur le droit','法律认识错误','Mistake of law'),t(
["N'est pas pénalement responsable la personne qui justifie avoir cru, par une erreur sur le droit qu'elle n'était pas en mesure d'éviter, pouvoir légitimement accomplir l'acte."],
['能够证明自己因无法避免的法律认识错误而相信可以合法实施该行为的人，不承担刑事责任。'],
['A person who establishes that, through a mistake of law which they were unable to avoid, they believed they could lawfully perform the act is not criminally liable.'])],
['122-4','defences',t('L’autorisation de la loi','法律授权与合法命令','Authorisation by law'),t(
["N'est pas pénalement responsable la personne qui accomplit un acte prescrit ou autorisé par des dispositions législatives ou réglementaires.","N'est pas pénalement responsable la personne qui accomplit un acte commandé par l'autorité légitime, sauf si cet acte est manifestement illégal."],
['实施法律或行政法规规定或者授权的行为的人，不承担刑事责任。','依合法当局命令实施行为的人，不承担刑事责任，但该行为明显违法的除外。'],
['A person who performs an act prescribed or authorised by statutory or regulatory provisions is not criminally liable.','A person who performs an act ordered by a lawful authority is not criminally liable, unless the act is manifestly unlawful.'])],
['122-5','defences',t('La légitime défense','正当防卫','Self-defence'),t(
["N'est pas pénalement responsable la personne qui, devant une atteinte injustifiée envers elle-même ou autrui, accomplit, dans le même temps, un acte commandé par la nécessité de la légitime défense d'elle-même ou d'autrui, sauf s'il y a disproportion entre les moyens de défense employés et la gravité de l'atteinte.","N'est pas pénalement responsable la personne qui, pour interrompre l'exécution d'un crime ou d'un délit contre un bien, accomplit un acte de défense, autre qu'un homicide volontaire, lorsque cet acte est strictement nécessaire au but poursuivi dès lors que les moyens employés sont proportionnés à la gravité de l'infraction."],
['面对针对本人或他人的不法侵害，在侵害发生的同时，出于保护本人或他人的正当防卫之必要而实施行为的人，不承担刑事责任，但所采用的防卫手段与侵害的严重程度不相称的除外。','为了制止正在实施的侵害财产的重罪或轻罪，实施故意杀人以外的防卫行为，且该行为对于所追求的目的确属必要、所采用的手段与犯罪的严重程度相称的人，不承担刑事责任。'],
['A person who, when confronted with an unjustified attack upon themselves or another, simultaneously performs an act required by the necessity of defending themselves or another is not criminally liable, unless the means of defence used are disproportionate to the seriousness of the attack.','A person who, to interrupt the commission of a crime or délit against property, performs an act of defence other than intentional homicide is not criminally liable where that act is strictly necessary for the purpose pursued and the means used are proportionate to the seriousness of the offence.'])],
['122-6','defences',t('La présomption de légitime défense','正当防卫的推定','Presumption of self-defence'),t(
["Est présumé avoir agi en état de légitime défense celui qui accomplit l'acte :","1° Pour repousser, de nuit, l'entrée par effraction, violence ou ruse dans un lieu habité ;",'2° Pour se défendre contre les auteurs de vols ou de pillages exécutés avec violence.'],
['为下列目的实施行为的人，推定为处于正当防卫状态：','1° 抵御夜间以破门、暴力或欺骗方式侵入有人居住的场所；','2° 抵御以暴力实施盗窃或抢掠的行为人。'],
['A person is presumed to have acted in self-defence when performing an act:','1° To repel entry at night into an inhabited place by breaking in, violence or deception;','2° To defend against perpetrators of theft or looting carried out with violence.'])],
['122-7','defences',t('L’état de nécessité','紧急避险','Necessity'),t(
["N'est pas pénalement responsable la personne qui, face à un danger actuel ou imminent qui menace elle-même, autrui ou un bien, accomplit un acte nécessaire à la sauvegarde de la personne ou du bien, sauf s'il y a disproportion entre les moyens employés et la gravité de la menace."],
['面对威胁本人、他人或财产的现实或迫近危险，实施为保护人身或财产所必需的行为的人，不承担刑事责任，但所采用的手段与危险的严重程度不相称的除外。'],
['A person who, faced with a present or imminent danger threatening themselves, another person or property, performs an act necessary to safeguard the person or property is not criminally liable, unless the means used are disproportionate to the seriousness of the threat.'])],
['221-1','life',t('Le meurtre','故意杀人','Murder'),t(
["Le fait de donner volontairement la mort à autrui constitue un meurtre.",'Il est puni de trente ans de réclusion criminelle.'],
['故意致他人死亡的行为构成故意杀人罪。','该罪处三十年重罪监禁。'],
['Intentionally causing the death of another person constitutes murder.','It is punishable by thirty years of criminal imprisonment.'])],
['311-1','theft',t('La définition du vol','盗窃的定义','Definition of theft'),t(
["Le vol est la soustraction frauduleuse de la chose d'autrui."],['盗窃是以非法占有为目的窃取他人财物的行为。'],['Theft is the fraudulent taking of property belonging to another.'])],
['311-2','theft',t('Le vol d’énergie','盗窃能源','Theft of energy'),t(
["La soustraction frauduleuse d'énergie au préjudice d'autrui est assimilée au vol."],['以非法占有为目的窃取能源、损害他人利益的行为，视同盗窃。'],['The fraudulent taking of energy to the detriment of another is treated as theft.'])],
['311-3','theft',t('La peine du vol simple','普通盗窃的刑罚','Penalty for simple theft'),t(
["Le vol est puni de trois ans d'emprisonnement et de 45 000 euros d'amende."],['盗窃处三年监禁及45,000欧元罚金。'],['Theft is punishable by three years’ imprisonment and a fine of €45,000.'])]
];
export const articles = rows.map(([id,group,title,text]) => ({id, group, title, text,
 effectiveFrom:id==='311-3'?'2002-01-01':'1994-03-01',
 source:group==='life'?'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070719/LEGISCTA000006136041/#LEGIARTI000006417561':`https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070719/${sections[group]}/`,
 checkedAt:'2026-10-31',translationStatus:'ai-unreviewed',
 related: ({'111-1':['111-2','111-3'],'111-2':['111-1','111-3'],'111-3':['111-2','111-4'],'111-4':['111-3','111-5'],'121-4':['121-5','121-6'],'121-6':['121-7'],'121-7':['121-6'],'122-5':['122-6','122-7'],'122-6':['122-5'],'122-7':['122-5'],'311-1':['311-2','311-3'],'311-3':['311-1']})[id] || []
}));
export default {schemaVersion:1,edition:'selection',books,groups,articles};
