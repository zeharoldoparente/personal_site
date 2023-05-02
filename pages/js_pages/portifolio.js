const repositories = document.querySelector(".home");

function getApiGitHub() {
   fetch("https://api.github.com/users/zeharoldoparente/repos").then(
      async (res) => {
         if (!res.ok) {
            throw new Error(res.status);
         }

         let data = await res.json();
         data.map((item) => {
            let project = document.createElement("main");

            project.innerHTML = `
            <main class="content-main">
               <div class="project">
                  <div>
                        <h4 class="title">${item.name}</h4>
                        <span class="date-create">${Intl.DateTimeFormat(
                           "pt-BR"
                        ).format(new Date(item.created_at))}</span>
                  </div>
                  <div>
                        <a href="${item.html_url}" target="_blank">${
               item.html_url
            }</a>
                        <span class="language"><span class="circle"></span>${
                           item.language
                        }</span>
                  </div>
               </div>
            </main>
            `;

            repositories.appendChild(project);
         });
      }
   );
}

getApiGitHub();
