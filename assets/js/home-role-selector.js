(() => {
  "use strict";

  const content = {
    fr: {
      employee: "L’introduction d’une IA ne change pas seulement l’outil que vous utilisez : elle peut modifier votre charge, votre autonomie, la manière dont votre activité est surveillée et la responsabilité qui vous incombe en cas d’erreur. Le temps gagné peut améliorer votre travail, mais il peut aussi être transformé en objectifs plus élevés ou en délais plus courts. Votre sécurité dépend donc des choix d’organisation : un temps réel pour vérifier, le droit de contester la sortie du système, une formation adaptée et la possibilité de signaler un problème sans être pénalisé·e.",
      employer: "Un modèle performant ne garantit pas, à lui seul, une organisation du travail sûre. Le déploiement peut déplacer la charge vers la vérification, accélérer les cadences, fragiliser certaines compétences ou créer une responsabilité sans pouvoir réel de décision. Vous pouvez agir sur ces risques en évaluant le travail avant l’achat, en associant les personnes concernées, en budgétant le temps de contrôle et en fixant des seuils de révision ou d’arrêt. La prévention des risques liés à l’IA devient ainsi une responsabilité de conception du travail, au même titre que sa performance technique et économique.",
      hr: "L’IA redistribue les tâches, les compétences, les possibilités d’évolution et parfois le sentiment de sécurité de l’emploi. Elle peut soutenir l’apprentissage et réduire certaines contraintes, mais aussi appauvrir les postes, accroître la surveillance ou laisser aux équipes un travail invisible de correction. Votre rôle est central pour anticiper ces transformations : clarifier ce qui changera réellement, organiser la formation et la mobilité, préserver les parcours d’apprentissage et vérifier que les gains de productivité se traduisent aussi par de meilleures conditions de travail.",
      physician: "Les effets sanitaires apparaissent souvent après que l’outil, les objectifs et les effectifs ont déjà changé. Votre place est donc en amont du déploiement. Il faut préciser le système utilisé, la tâche concernée, le caractère obligatoire ou non de l’usage, le travail de vérification ajouté, les modalités de surveillance et la possibilité réelle de contester une recommandation. Après le déploiement, les signaux collectifs — corrections tardives, incidents, perte d’entraide, absentéisme ou tensions sur la responsabilité — permettent d’évaluer le système de travail plutôt que d’attribuer les difficultés aux seuls individus.",
      osh: "Le risque ne réside pas uniquement dans la sortie du modèle, mais dans la façon dont celui-ci transforme le travail réel. Votre analyse peut relier le déploiement aux facteurs psychosociaux connus : intensité du travail, exigences émotionnelles, autonomie, rapports sociaux, conflits de valeurs et insécurité de la situation. Elle doit aussi repérer la charge de vérification, la dépendance au système et l’érosion possible des compétences. L’enjeu est de construire avec l’entreprise des mesures collectives, des indicateurs de suivi et des conditions explicites de révision ou de retrait.",
      representative: "La consultation ne devrait pas se limiter à une présentation de l’outil. Un déploiement d’IA peut modifier l’allocation des tâches, les objectifs, les critères d’évaluation, la surveillance, les effectifs et les possibilités de recours. Vous pouvez demander quelles activités disparaissent ou apparaissent, qui vérifiera les résultats, avec quel temps et quelle responsabilité, quelles données seront utilisées et dans quelles conditions le système pourra être suspendu. Une participation utile donne aux travailleurs une influence réelle sur les choix qui déterminent leur santé et leur capacité à bien faire leur travail.",
      ai: "La sécurité du produit ne s’arrête pas à l’exactitude, aux biais, à la confidentialité ou à la cybersécurité. Une interface, une politique de mise à jour ou un mécanisme de supervision peuvent rendre le contrôle humain purement théorique s’ils n’offrent ni temps, ni information, ni pouvoir d’interrompre le système. Vous pouvez intégrer la sécurité des travailleurs aux exigences techniques : traçabilité des changements, signalement des incidents, fonctionnement dégradé, possibilité de retour en arrière, mesure du travail de vérification et évaluation des effets sur les équipes après chaque évolution importante.",
      researcher: "Un système peut réussir ses évaluations techniques tout en contribuant à créer un emploi plus intense, plus surveillé ou moins formateur. Les conditions de déploiement font donc partie du problème de sécurité. Au-delà des performances du modèle, la recherche et la conception peuvent étudier le travail de vérification imposé aux humains, la possibilité réelle de reprendre la main, les effets différenciés selon les métiers et la conservation des compétences. L’auditabilité, le suivi des incidents et le retrait sûr d’un système sont aussi des caractéristiques du produit, pas seulement des obligations laissées à l’organisation utilisatrice.",
      public: "L’exposition professionnelle à l’IA concerne potentiellement des centaines de millions de personnes. Même un effet moyen modeste sur la charge, l’autonomie, la sécurité de l’emploi ou le soutien social peut donc produire un enjeu collectif important. L’action publique peut fixer des garanties minimales : participation des travailleurs, transparence sur les usages, limites à la surveillance, voies de contestation, protection contre les représailles et suivi indépendant des effets sanitaires. Elle peut aussi financer les études longitudinales et les outils de prévention dont le déploiement rapide de l’IA a besoin."
    },
    en: {
      employee: "Introducing AI changes more than the tool you use. It can alter your workload, autonomy, how your work is monitored and the responsibility you carry when something goes wrong. Time saved can improve your job, but it can also be converted into higher targets or shorter deadlines. Your safety therefore depends on work-design choices: genuine time to check outputs, the authority to challenge the system, appropriate training and the ability to report a problem without being penalised.",
      employer: "A high-performing model does not, by itself, guarantee a safe work system. Deployment can shift effort into verification, accelerate work, weaken skills or leave employees accountable without meaningful authority. You can address these risks by assessing real work before procurement, involving affected workers, budgeting time for oversight and defining clear thresholds for redesign or withdrawal. Preventing AI-related workplace risks is therefore a work-design responsibility alongside technical and economic performance.",
      hr: "AI redistributes tasks, skills, career opportunities and, in some cases, people’s sense of job security. It can support learning and reduce demands, but it can also impoverish roles, increase surveillance or leave teams with invisible correction work. HR has a central role in anticipating these changes: explain what will actually change, organise training and mobility, preserve pathways through which people develop expertise and ensure that productivity gains also translate into better working conditions.",
      physician: "Health effects often become visible only after the tool, targets and staffing have already changed. Occupational-health input therefore belongs upstream of deployment. The assessment should identify the system, the task, whether use is voluntary or mandatory, the verification work added, any monitoring involved and whether a worker can genuinely challenge a recommendation. After deployment, group-level signals — late corrections, incidents, reduced peer support, absence or conflicts over accountability — help assess the work system rather than treating difficulties as individual failings.",
      osh: "Risk does not lie only in a model’s output, but in how it changes real work. Your assessment can connect deployment with established psychosocial factors: work intensity, emotional demands, autonomy, workplace relationships, value conflicts and job insecurity. It should also identify verification burden, dependence on the system and possible erosion of skills. The aim is to develop collective controls, monitoring indicators and explicit conditions for redesign or withdrawal with the organisation.",
      representative: "Consultation should go beyond a demonstration of the tool. AI deployment can change task allocation, targets, performance criteria, monitoring, staffing and routes of appeal. Worker representatives can ask which activities will disappear or emerge, who will check outputs, with what time and accountability, which data will be used and when the system can be suspended. Meaningful participation gives workers real influence over decisions that affect their health and their ability to do good work.",
      ai: "Product safety does not end with accuracy, bias, privacy or cybersecurity. An interface, update policy or oversight mechanism can make human control largely theoretical if people lack the time, information or authority to stop the system. Worker safety can be built into technical requirements through change traceability, incident reporting, degraded-mode operation, safe rollback, measurement of verification work and assessment of team-level effects after every material update.",
      researcher: "A system can pass technical evaluations while contributing to work that is more intense, more closely monitored or less developmental. Deployment conditions are therefore part of the safety problem. Beyond model performance, research and design can examine the verification work imposed on people, whether human control is meaningful, how effects differ across occupations and whether skills are maintained. Auditability, incident monitoring and safe withdrawal are product characteristics, not merely duties left to deploying organisations.",
      public: "Workplace exposure to AI potentially concerns hundreds of millions of people. Even a modest average effect on workload, autonomy, job security or social support can therefore become a major population-level issue. Public policy can establish minimum safeguards for worker participation, transparency, limits on surveillance, contestability, protection from retaliation and independent monitoring of health effects. It can also fund the longitudinal research and practical prevention tools required by the speed and scale of AI deployment."
    }
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll("[data-role-explainer]").forEach((root) => {
    const locale = root.dataset.locale === "en" ? "en" : "fr";
    const select = root.querySelector("[data-role-select]");
    const output = root.querySelector("[data-role-answer]");
    const announcer = root.querySelector("[data-role-announcer]");
    let timer = 0;

    if (!select || !output || !announcer) return;

    const render = (key, animate = true) => {
      const text = content[locale][key];
      if (!text) return;

      window.clearTimeout(timer);
      announcer.textContent = "";

      if (!animate || reduceMotion.matches) {
        output.classList.remove("is-typing");
        output.textContent = text;
        announcer.textContent = text;
        return;
      }

      output.textContent = "";
      output.classList.add("is-typing");
      let index = 0;

      const typeNextChunk = () => {
        index = Math.min(index + 5, text.length);
        output.textContent = text.slice(0, index);
        if (index < text.length) {
          timer = window.setTimeout(typeNextChunk, 9);
        } else {
          output.classList.remove("is-typing");
          announcer.textContent = text;
        }
      };

      timer = window.setTimeout(typeNextChunk, 120);
    };

    select.addEventListener("change", () => render(select.value));
    render(select.value);
  });
})();
