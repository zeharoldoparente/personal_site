document.addEventListener("DOMContentLoaded", () => {
   let reposData = [];
   let displayedRepos = 0;
   const reposPerLoad = 4;
   const username = "zeharoldoparente";

   function createTimelineSkeleton() {
      const portfolioSection = document.querySelector(".container");

      const headerHTML = `
       <div class="portfolio-header fade-in">
         <h1>Meus Projetos no GitHub</h1>
       </div>
       <p class="portfolio-description fade-in">
         Confira abaixo meus projetos de desenvolvimento. Cada projeto representa uma oportunidade
         de aprendizado e crescimento profissional em diferentes tecnologias e conceitos.
       </p>
     `;

      const header =
         portfolioSection.querySelector("header").parentElement.outerHTML;
      portfolioSection.innerHTML = header;
      portfolioSection.insertAdjacentHTML("beforeend", headerHTML);

      const timeline = document.createElement("div");
      timeline.className = "timeline";
      portfolioSection.appendChild(timeline);

      const loadingElement = document.createElement("div");
      loadingElement.className = "loading";
      loadingElement.innerHTML = `
       <div class="spinner"></div>
       <p>Carregando projetos...</p>
     `;
      loadingElement.style.textAlign = "center";
      loadingElement.style.margin = "40px 0";
      timeline.appendChild(loadingElement);

      const loadMoreButton = document.createElement("button");
      loadMoreButton.id = "load-more";
      loadMoreButton.className = "load-more";
      loadMoreButton.textContent = "Carregar mais projetos";
      loadMoreButton.style.display = "none";
      portfolioSection.appendChild(loadMoreButton);

      return { timeline, loadMoreButton };
   }

   function generateRepoImage(repoName, language) {
      let hash = 0;
      for (let i = 0; i < repoName.length; i++) {
         hash = repoName.charCodeAt(i) + ((hash << 5) - hash);
      }

      let color = "#";
      for (let i = 0; i < 3; i++) {
         const value = (hash >> (i * 8)) & 0xff;
         color += ("00" + value.toString(16)).substr(-2);
      }

      const langColors = {
         JavaScript: "#f1e05a",
         TypeScript: "#2b7489",
         HTML: "#e34c26",
         CSS: "#563d7c",
         Python: "#3572A5",
         Java: "#b07219",
         "C#": "#178600",
         PHP: "#4F5D95",
         Dart: "#00B4AB",
         Swift: "#ffac45",
         Go: "#00ADD8",
      };

      const langColor =
         language && langColors[language] ? langColors[language] : "#00abf0";

      return `https://dummyimage.com/600x400/${color.substring(
         1
      )}/ffffff&text=${encodeURIComponent(repoName)}`;
   }

   function formatDate(dateString) {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("pt-BR", options);
   }

   function getRepoDescription(repo) {
      if (repo.description && repo.description.trim() !== "") {
         return repo.description;
      }
      const words = repo.name.split(/[-_]/);
      if (words.length > 1) {
         const formattedWords = words.map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
         );
         return `Projeto ${formattedWords.join(" ")} desenvolvido em ${
            repo.language || "múltiplas linguagens"
         }.`;
      }

      return `Repositório ${repo.name} contendo códigos em ${
         repo.language || "múltiplas linguagens"
      }.`;
   }

   function createProjectCard(repo, index) {
      const isEven = index % 2 === 0;
      const position = isEven ? "left" : "right";
      const date = formatDate(repo.created_at);
      const description = getRepoDescription(repo);
      const repoImage = generateRepoImage(repo.name, repo.language);

      const card = document.createElement("div");
      card.className = `project-card ${position}`;
      card.style.setProperty("--index", index);

      card.innerHTML = `
       <div class="project-image">
         <img src="${repoImage}" alt="${repo.name}" />
         ${
            repo.language
               ? `<span class="language-tag">${repo.language}</span>`
               : ""
         }
       </div>
       <div class="project-title">
         <h2>${repo.name}</h2>
         <span class="project-date">${date}</span>
       </div>
       <p class="project-description">${description}</p>
       <div class="project-stats">
         <div class="stars">
           <i class='bx bxs-star'></i>
           <span>${repo.stargazers_count || 0}</span>
         </div>
         <div class="forks">
           <i class='bx bx-git-repo-forked'></i>
           <span>${repo.forks_count || 0}</span>
         </div>
         <div class="size">
           <i class='bx bx-code-block'></i>
           <span>${Math.round(repo.size / 1024)} KB</span>
         </div>
       </div>
       <div class="project-links">
         <a href="${repo.html_url}" target="_blank">
           <i class='bx bxl-github'></i> Ver no GitHub
         </a>
         ${
            repo.homepage
               ? `
           <a href="${repo.homepage}" target="_blank">
             <i class='bx bx-link-external'></i> Demo
           </a>
         `
               : ""
         }
       </div>
     `;

      return card;
   }

   function loadMoreRepos() {
      const startIndex = displayedRepos;
      const endIndex = Math.min(
         displayedRepos + reposPerLoad,
         reposData.length
      );

      if (startIndex < reposData.length) {
         for (let i = startIndex; i < endIndex; i++) {
            const card = createProjectCard(reposData[i], i);
            timelineElement.appendChild(card);

            setTimeout(() => {
               card.style.opacity = "1";
            }, 50 * (i - startIndex));
         }

         displayedRepos = endIndex;

         if (displayedRepos >= reposData.length) {
            loadMoreElement.style.display = "none";
         }
      }
   }

   async function fetchGitHubRepos() {
      try {
         const { timeline, loadMoreButton } = createTimelineSkeleton();
         timelineElement = timeline;
         loadMoreElement = loadMoreButton;

         const response = await fetch(
            `https://api.github.com/users/${username}/repos?sort=created&direction=desc`
         );

         if (!response.ok) {
            throw new Error(`Erro ao buscar repositórios: ${response.status}`);
         }

         reposData = await response.json();

         const loadingElement = timelineElement.querySelector(".loading");
         if (loadingElement) {
            loadingElement.remove();
         }

         if (reposData.length === 0) {
            const noReposElement = document.createElement("p");
            noReposElement.className = "placeholder-text";
            noReposElement.textContent = "Nenhum repositório encontrado.";
            timelineElement.appendChild(noReposElement);
            return;
         }

         loadMoreRepos();

         if (displayedRepos < reposData.length) {
            loadMoreElement.style.display = "block";
            loadMoreElement.addEventListener("click", loadMoreRepos);
         }
      } catch (error) {
         console.error("Erro:", error);

         const errorElement = document.createElement("div");
         errorElement.className = "error-message";
         errorElement.innerHTML = `
         <i class='bx bx-error-circle'></i>
         <p>Não foi possível carregar os projetos. Tente novamente mais tarde.</p>
       `;

         const loadingElement = timelineElement.querySelector(".loading");
         if (loadingElement) {
            loadingElement.remove();
         }

         timelineElement.appendChild(errorElement);
      }
   }

   let timelineElement;
   let loadMoreElement;

   fetchGitHubRepos();
});
