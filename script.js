console.log('connecté !');

// PSEUDO CODE GENERAL: Appel de l'API de Raindrop.io pour afficher mes articles de la catégorie frontend.
// I.Pour chaque item de la catégorie FRONTEND afficher le titre en lien cliquable et afficher également le domaine d'origine et mes tags
//II. Permettre de filtrer par tag
//III. Afficher le nombre d'articles présents dans chaque tag
//IV. Avoir un tag par défault ALL qui permet d'afficher tous les résultats
//V. Styler le tab quand cliqué



const apiToken = '71adbd20-9316-4dde-90f0-b1e280422f6e';
const COLLECTION_ID = '34205862';
const apiUrl = `https://api.raindrop.io/rest/v1/raindrops/34205862`;

const articleList = document.querySelector('#article-list');
console.log(articleList)

const tabContainer = document.querySelector('.filters');
console.log(tabContainer)
 

async function callRaindrop() {
  try {
    const responseJSON = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });
    
    const responseJS = await responseJSON.json();
    console.log('objet JS', responseJS);

    // I.1.Create an empty string to then(I.2.) accumulate the HTML code for each item in the response and then(I.3) append it to the articleList element at once.
    let itemsHTML = '';
    
    //III.1 we introduce a tagCounts object to store the count for each tag. Initially, all the counts are set to 0. As we iterate over the items, we increment the count for each tag encountered. Then, when creating the tabs, we set the count for each tab based on the tagCounts object.
    const tagCounts = {};

    //II.1.Retrieve all the unique tags from the API response using REDUCE METHOD
    const allTags = responseJS.items.reduce((tags, item) => {
      item.tags.forEach(tag => {//nécessaire de mettre .tags.forEach pour que ça itère bien sur les chaque tag de l'item
        if (!tags.includes(tag)){
          tags.push(tag)
        }
        tagCounts[tag] = 0; //III. Initialize the count for each tag
      });
      return tags;
    }, []);
    console.log(allTags)

    //II.2.Display tabs based on the individual tag of allTags
    allTags.forEach(tag => {
      const tab = document.createElement('button');
      tab.classList.add('tab');
      tab.innerText = tag;
      tab.setAttribute('data-filter', tag);
      tabContainer.appendChild(tab);
      //III.1 Créer un span à l'intérieur du bouton qui montrera ensuite le nombre d'articles à l'intérieur
      const numberOfArticlesInside = document.createElement('span');
      numberOfArticlesInside.classList.add('count');
      tab.appendChild(numberOfArticlesInside);
    });


    //I.2. Create a loop that iterates over the items in the response (for (let item of responseJS.items))
    for (let item of responseJS.items) {

      let tagsHTML = ''; // Declare and initialize tagsHTML variable outside of the loop to prevent that with every iteration of the loop, tagsHTML would be getting reset to an empty string, and therefore only the last tag would be displayed
      for (let tag of item.tags) {//II.4.Créer un template literals pour chaque tag afin d'afficher chaque tag de manière séparée et avec un # devant le tag
        tagsHTML += `#${tag} `; // Append each tag with a hashtag to the string
        tagCounts[tag]++; //III. Increment the count for each tag
        console.log(tagCounts)
      }

    
    //II.3.Add event listeners to the tab
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(tab => {
        const filter = tab.getAttribute('data-filter');
        const countDisplay = tab.querySelector('.count');
        countDisplay.innerText = tagCounts[filter].toString();// Update the count for each tab
      });

    //III.
    const filters = document.querySelectorAll('.filter-item');

    filters.forEach((item) => {
      const tags = item.classList;
      allTags.forEach((tag) => {
        if (tags.contains(`tag-${tag}`)) {
          const tab = document.querySelector(`.tab[data-filter="${tag}"]`);
          const countDisplay = tab.querySelector('.count');
          const currentCount = parseInt(countDisplay.innerText);
          countDisplay.innerText = (currentCount + 1).toString();
        }
      });
    });

    

      const createdDate = new Date(item.created);//// Convert the created date to a Date object

      const formattedDate = // Format the Date obkect in dd/mm/yyyy format
      `
      ${createdDate.getDate()}/0${createdDate.getMonth() +1}/${createdDate.getFullYear()}
      `
  
      //I.3. CONSTRUCT THE HTML CODE FOR EACH ITEM
      //ET II.6.Modify the HTML template in the callRaindrop function to add the appropriate TAG classes to each item based on its tags.(c'est la 1ère ligne du innerHTML ci-dessous)
      itemsHTML += 
      `
        <li class="filter-item ${item.tags.map(tag => `tag-${tag}`).join(' ')}">
          <span class="rond"></span> 
          <div class="article-liner">
            <a href="${item.link}" target="blank">${item.title}</a>
            <hr>
            <span class="date">${formattedDate}</span>
          </div>
          <div class="article-details">
            <a class="domain" href="${item.domain}" target="blank">${item.domain}</a>
            <span class="tag">${tagsHTML}</span>
          </div>
        </li>
      `
    }
    articleList.innerHTML = itemsHTML;//append each <li> to articleList

    //III. Update the count for each tab
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      const filter = tab.getAttribute('data-filter');
      const countDisplay = tab.querySelector('.count');
      countDisplay.innerText = tagCounts[filter].toString();

      tab.addEventListener('click', () => {
        if (!document.startViewTransition) {
          filterItems(filter);
          return;}
        else{
          document.startViewTransition(() =>//------------- VIEW TRANSITIONS
          filterItems(filter)
          )
        }
      });
    });

    //IV.Filtre ALL par défaut qui affiche tous les résultats et affiche le nombre d'articles total
    const tousLesBoutons = document.querySelector('.filters')
    console.log(tousLesBoutons)
    const theAllBtn = document.createElement('button');
    theAllBtn.classList.add('tab', 'btnAll', 'active');
    theAllBtn.innerText = 'All';
    tousLesBoutons.insertBefore(theAllBtn, tousLesBoutons.firstChild);
    const articlesInsideTheAllBtn = document.createElement('span');
    articlesInsideTheAllBtn.classList.add('count');
    theAllBtn.appendChild(articlesInsideTheAllBtn);

    let allCount = 0

    const articlesResult = document.querySelectorAll('.filter-item');
    console.log(articlesResult)

    for (let item of articlesResult){
      allCount++
    }
    console.log(allCount)
    articlesInsideTheAllBtn.innerText = allCount

    theAllBtn.addEventListener('click',() => {
      btnAllFilter()
    })
    
    //V.1 Styler le tab quand cliqué
    const allTabs = document.querySelectorAll('.tab')
    console.log('allTabs', allTabs)
    allTabs.forEach((tab) => {
      tab.addEventListener('click', (e)=> {
        console.log('tab cliqué')
        for(let tab of allTabs){//V.2. Si un autre tab que celui cliqué est déjà stylé, supprimer le style sur l'autre et l'ajouter sur le cliqué 
          if(tab.classList.contains('active')){
            tab.classList.remove('active')
            e.target.classList.add('active')
          }
        }
        })
      })
    
      

    return true; // NECESSAIRE POUR LES FILTRES EN DESSOUS : Return true to indicate that the function has completed successfully
  } catch (error) {
    console.log(error, 'erreur');
    return false; // NECESSAIRE POUR LES FILTRES EN DESSOUS : Return false to indicate that the function has failed
  }
}

callRaindrop();


//II.5. Montrer tous les résultats par défaut avec ALL et filtrer par classe dynamique au clic sur chaque tab
//ET III.1 Afficher le nombre d'articles dans chaque tab
function filterItems(filter) {
  const filters = document.querySelectorAll('.filter-item');

  let count = 0;

  filters.forEach((item) => {
    if (filter === 'all' || item.classList.contains(`tag-${filter}`)) {
      item.style.display = 'block';
      count++;
    } else {
      item.style.display = 'none';
    }
  });
}

//IV. Fonction qui permet l'affichage de tous les items (ajouter ensuite à l'eventListener 'click' sur theAllBtn)
function btnAllFilter(){
  const articles = document.querySelectorAll('.filter-item')
  console.log('IV. pour trouver tous les articles', articles)

  const btnAll = document.querySelector('.btnAll')
  console.log(btnAll)

  articles.forEach((item) => {
    item.style.display = 'block'
  })
}


