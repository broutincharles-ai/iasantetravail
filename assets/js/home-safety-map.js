(() => {
  'use strict';
  const root = document.querySelector('.home-simulation');
  if (!root) return;
  const zoneDescriptions = {
    risk: ['Far West algorithmique', 'Cadences accrues, surveillance et autonomie réduite peuvent se diffuser. À grande échelle, les RPS associés peuvent constituer un risque de santé publique. La dépendance aux systèmes peut aussi affaiblir les compétences et le pouvoir économique et social des travailleurs.'],
    late: ['Pilotes en roue libre', 'Les expérimentations se multiplient avec peu de suivi du travail réel. Vérifications, corrections et objectifs accrus peuvent intensifier le travail, tandis que la dépendance aux outils fragilise les compétences et la capacité de décision. La diffusion de ces situations pose la question de leurs effets systémiques.'],
    safe: ['IA capacitante', 'Le déploiement vise à alléger la charge, préserver les compétences et renforcer la capacité d’agir. Associer les travailleurs aux décisions et au partage des gains peut soutenir leur santé et leur pouvoir économique et social.'],
    tempo: ['Le bon tempo', 'Tester avec les salariés, observer les effets sur la charge et l’autonomie, puis ajuster avant de généraliser. Suivre aussi les changements de compétences, d’effectifs et de partage de la valeur pour anticiper les risques de santé publique et de perte de pouvoir.'],
    hidden: ['Mode autruche', 'Une faible ambition affichée peut masquer des usages informels. Leurs effets sur la charge, les compétences et les décisions restent peu visibles, ce qui complique l’anticipation des risques psychosociaux et de leurs conséquences collectives.'],
    standstill: ['Comité de pilotage perpétuel', 'Les principes de prévention gagnent à être éprouvés par des expérimentations encadrées. Observer la charge, les compétences et le partage des gains permet de discuter des effets sur la santé et le pouvoir économique et social avant la généralisation.']
  };
  const zones = [...root.querySelectorAll('.map-zone')];
  zones.forEach(zone => {
    zone.addEventListener('click', () => {
      zones.forEach(item => item.setAttribute('aria-pressed', String(item === zone)));
      const [title, description] = zoneDescriptions[zone.dataset.zone];
      root.querySelector('#map-detail-title').textContent = title;
      root.querySelector('#map-detail-text').textContent = description;
    });
  });
})();
