if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

// api details
const appId = "adce8987"
const appKey = "954fe3fbb51c3e985f3523ef8df0c071"

const searchResultsWrapper = document.querySelector('.search-results-wrapper')
const searchFeedbackBox = document.querySelector('.search-feedback-box')

// asynchronous functions
async function fetchData(item) {

    let searchResult;

    await fetch(`https://trackapi.nutritionix.com/v2/search/instant?query=${item}`,
        {
            headers: {
                "x-app-id": appId,
                "x-app-key": appKey,
            },
        })
        .then(res => res.json())
        .then(data => searchResult = data)
    return searchResult
}

async function extractData(dataFromFetch) {
    let rawData = await dataFromFetch
    let commonFoods = rawData['common']
    let brandedFoods = rawData['branded']

    // common foods
    for (let i=0; i<commonFoods.length; i++) {
        extractedData = await commonFoods[i]
        
        let foodName = extractedData['food_name']
        let foodPhoto = extractedData['photo']['thumb']
        let foodBox = document.createElement('button')
        foodBox.classList.add('food-box')

        foodBox.id = foodName

        foodBoxContent = `
        <img class="food-box-img" src=${foodPhoto}>
        <div class="food-name">
            ${capitalizeFirstLetter(foodName)}
        </div>`

        foodBox.innerHTML = foodBoxContent
        foodBox.addEventListener('click', commonFoodClicked)
        searchResultsWrapper.append(foodBox)
    }

    // branded foods
    for (let i=0; i<brandedFoods.length; i++) {
        extractedData = await brandedFoods[i]

        let foodBrandName = extractedData['brand_name']
        let foodName = extractedData['food_name']
        let foodID = extractedData['nix_item_id']
        let foodPhoto = extractedData['photo']['thumb']
        let foodBox = document.createElement('button')
        foodBox.classList.add('food-box')

        foodBox.id = foodID

        foodBoxContent = `
        <img class="food-box-img" src=${foodPhoto}>
        <div class="food-name">
            ${foodName}
        </div>
        <div class="brand-name">
            from<br>${foodBrandName}
        </div>`

        foodBox.innerHTML = foodBoxContent
        foodBox.addEventListener('click', brandedFoodClicked)
        searchResultsWrapper.append(foodBox)
    }
}

async function getCommonFoodNutrients(id) {
    let results;
    await fetch(`https://trackapi.nutritionix.com/v2/natural/nutrients`, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            "x-app-id": "adce8987",
            "x-app-key": "954fe3fbb51c3e985f3523ef8df0c071"
            },
            body: JSON.stringify({
                "query": id
            })
        })
        .then(res => res.json())
        .then(data => results = data)
    return results
}

async function getBrandedFoodNutrients(id) {
    let results;
    await fetch(`https://trackapi.nutritionix.com/v2/search/item?nix_item_id=${id}`, {
        headers: {
            "x-app-id": appId,
            "x-app-key": appKey,
            }
        })
        .then(res => res.json())
        .then(data => results = data)
    return results
}

//food clicked functions
async function brandedFoodClicked(e) {
    let idBrandFood = e.target.closest('button')
    let id = idBrandFood.id
    let foodInfo = await getBrandedFoodNutrients(id)
    let nutrientInfo = foodInfo['foods'][0]

    removeAllChildNodes(searchResultsWrapper)
    removeAllChildNodes(searchFeedbackBox)

    let foodName = nutrientInfo['food_name']
    let foodphoto = nutrientInfo['photo']['thumb']
    let brandName = nutrientInfo['brand_name']
    let fullNutrients = nutrientInfo['full_nutrients'].reverse()
    let calories = nutrientInfo['nf_calories']
    let totalFat = nutrientInfo['nf_total_fat']
    let saturatedFat = nutrientInfo['nf_saturated_fat']
    let polyUnsaturatedFat = 0;
    let monoUnsaturatedFat = 0;
    let cholesterol = nutrientInfo['nf_cholesterol']
    let sodium = nutrientInfo['nf_sodium']
    let potassium = nutrientInfo['nf_potassium']
    let carbohydrates = nutrientInfo['nf_total_carbohydrate']
    let dietaryFiber = nutrientInfo['nf_dietary_fiber']
    let sugars = nutrientInfo['nf_sugars']
    let protein = nutrientInfo['nf_protein']

    //daily value calcs
    let totalFatDV = ((totalFat*100)/65).toFixed(0)
    let saturatedFatDV = ((saturatedFat*100)/20).toFixed(0)
    let cholesterolDV = ((cholesterol*100)/300).toFixed(0)
    let sodiumDV = ((sodium*100)/2400).toFixed(0)
    let potassiumDV = ((potassium*100)/3500).toFixed(0)
    let carbohydratesDV = ((carbohydrates*100)/300).toFixed(0)
    let dietaryFiberDV = ((dietaryFiber*100)/25).toFixed(0)
    let sugarsDV = ((sugars*100)/50).toFixed(0)
    let proteinDV = ((protein*100)/50).toFixed(0)


    for (let i = 0; i< fullNutrients.length; i++) {
        if (fullNutrients[i]['attr_id'] == 645) {
            monoUnsaturatedFat = fullNutrients[i]['value']
        } else if (fullNutrients[i]['attr_id'] == 646) {
            polyUnsaturatedFat = fullNutrients[i]['value']
        }
          
    }

    calories = parseFloat(calories).toFixed(0)
    totalFat = parseFloat(totalFat).toFixed(0)
    saturatedFat = parseFloat(saturatedFat).toFixed(0)
    polyUnsaturatedFat = parseFloat(polyUnsaturatedFat).toFixed(0)
    monoUnsaturatedFat = parseFloat(monoUnsaturatedFat).toFixed(0)
    cholesterol = parseFloat(cholesterol).toFixed(0)
    sodium = parseFloat(sodium).toFixed(0)
    potassium = parseFloat(potassium).toFixed(0)
    carbohydrates = parseFloat(carbohydrates).toFixed(0)
    dietaryFiber = parseFloat(dietaryFiber).toFixed(0)
    sugars = parseFloat(sugars).toFixed(0)
    protein = parseFloat(protein).toFixed(0)

    //Burn calcs
    let walkingBurnDuration = parseFloat((calories/223)*60).toFixed(0)
    let runningBurnDuration = parseFloat((calories/653)*60).toFixed(0)
    let cyclingBurnDuration = parseFloat((calories/258)*60).toFixed(0)

    let nutritionInfoWrapper = document.createElement('div')
    nutritionInfoWrapper.classList.add('nutrition-info-wrapper')
    
    nutritionInfoWrapperContent = `
                    <div class="nutrition-info-header">
                    <img src=${foodphoto} class="nutrition-info-img">
                    <div class="nutrition-info-food-name">
                        ${capitalizeFirstLetter(foodName)} from ${capitalizeFirstLetter(brandName)}
                    </div>
                    </div>
                    <div class="nutrition-info-body">
        <div class="nutrition-facts-box">
            <div class="nutrition-facts-title">
                NUTRITION FACTS
            </div>
            <div class="nutrition-facts-food-name">
                ${foodName}
            </div>
            <div class="nutrition-facts-nutrients-box">
                <div class="amount-per-serving-row">
                    Amount per Serving
                </div>
                <div class="calories-row">
                    Calories
                    <div class="calories-value">
                        ${calories}
                    </div>
                </div>
                <div class="percent-daily-value-row">
                    % Daily Value
                </div>
                <div class="total-fat-row">
                    <div class="row-info-box">
                        Total Fat
                        <div class="total-fat-value">
                           ${totalFat}g
                        </div> 
                    </div>
                    <div class="total-fat-daily-value">
                        ${totalFatDV}%
                    </div>                                       
                </div>
                <div class="total-fat-subrows">
                    <div class="saturated-fat-row">
                        <div class="row-info-box">
                            Saturated Fat
                            <div class="saturated-fat-value">
                                ${saturatedFat}g
                            </div>
                        </div>
                        <div class="saturated-fat-daily-value">
                            ${saturatedFatDV}%
                        </div>
                    </div>
                    <div class="poly-fat-row">
                        <div class="row-info-box">
                                Polyunsaturated Fat 
                            <div class="poly-fat-value">
                                ${polyUnsaturatedFat}g
                            </div>
                        </div>                                       
                    </div>
                    <div class="mono-fat-row">
                        <div class="row-info-box">
                                monounsaturated Fat 
                            <div class="mono-fat-value">
                                ${monoUnsaturatedFat}g
                            </div>
                        </div>                                     
                    </div>
                </div>
                <div class="cholesterol-row">
                    <div class="row-info-box">
                            Cholesterol
                        <div class="cholesterol-value">
                            ${cholesterol}mg
                        </div>
                    </div>                                  
                    <div class="cholesterol-daily-value">
                        ${cholesterolDV}%
                    </div>
                </div>
                <div class="sodium-row">
                    <div class="row-info-box">
                            Sodium
                        <div class="sodium-value">
                            ${sodium}mg
                        </div>
                    </div>                                  
                    <div class="sodium-daily-value">
                        ${sodiumDV}%
                    </div>
                </div>
                <div class="potassium-row">
                    <div class="row-info-box">
                            Potassium
                        <div class="potassium-value">
                            ${potassium}mg
                        </div>
                    </div>                                   
                    <div class="potassium-daily-value">
                        ${potassiumDV}%
                    </div>
                </div>
                <div class="total-carbohydrates-row">
                    <div class="row-info-box">
                            Total Carbohydrates
                        <div class="total-carbohydrates-value">
                            ${carbohydrates}mg
                        </div>
                    </div>                                  
                    <div class="total-carbohydrates-daily-value">
                        ${carbohydratesDV}%
                    </div>
                </div>
                <div class="total-carbohydrates-subrow">
                    <div class="total-carbohydrates-subrows">
                        <div class="dietary-fiber-row">
                            <div class="row-info-box">
                                    Dietary Fiber
                                <div class="dietary-fiber-value">
                                    ${dietaryFiber}g
                                </div>
                            </div>                                              
                            <div class="dietary-fiber-daily-value">
                                ${dietaryFiberDV}%
                            </div>
                        </div>
                        <div class="sugars-row">
                            <div class="row-info-box">
                                    Sugars 
                                <div class="sugars-value">
                                    ${sugars}g
                                </div>
                            </div> 
                            <div class="sugars-daily-value">
                                ${sugarsDV}%
                            </div>                                       
                        </div>
                    </div>
                    <div class="protein-row">
                        <div class="row-info-box">
                                Protein 
                            <div class="protein-value">
                                ${protein}g
                            </div>
                        </div>
                        <div class="protein-daily-value">
                            ${proteinDV}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="nutrition-burn-kcal-flex-box">
            <div class="nutrition-burn-kcal-wrapper">

                <div class="burn-kcal-info-box">
                    <div class="burn-kcal-header">
                        How long would it take to burn 210 kCal
                    </div>
                    <div class="burn-kcal-info">
                        <div class="burn-info-row">
                            <div class="walking-burn-info">
                                Walking(3mph)
                            </div>
                            <div class="walking-burn-duration">
                                ${walkingBurnDuration} minutes
                            </div>
                        </div>
                        <div class="burn-info-row">
                            <div class="running-burn-info">
                                Running(6mph)
                            </div>
                            <div class="running-burn-duration">
                                ${runningBurnDuration} minutes
                            </div>
                        </div>
                        <div class="burn-info-row">
                            <div class="cycling-burn-info">
                                Cycling(10mph)
                            </div>
                            <div class="cycling-burn-duration">
                                ${cyclingBurnDuration} minutes
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`

    nutritionInfoWrapper.innerHTML = nutritionInfoWrapperContent
    searchResultsWrapper.append(nutritionInfoWrapper)
}

async function commonFoodClicked(e) {
    let idCommonFood = e.target.closest('button')
    let id = idCommonFood.id
    let foodInfo = await getCommonFoodNutrients(id)
    let nutrientInfo = foodInfo['foods'][0]

    removeAllChildNodes(searchResultsWrapper)
    removeAllChildNodes(searchFeedbackBox)

    let foodphoto = nutrientInfo['photo']['thumb']
    let foodName = nutrientInfo['food_name']
    let fullNutrients = nutrientInfo['full_nutrients'].reverse()
    let calories = nutrientInfo['nf_calories']
    let totalFat = nutrientInfo['nf_total_fat']
    let saturatedFat = nutrientInfo['nf_saturated_fat']
    let polyUnsaturatedFat = 0;
    let monoUnsaturatedFat = 0;
    let cholesterol = nutrientInfo['nf_cholesterol']
    let sodium = nutrientInfo['nf_sodium']
    let potassium = nutrientInfo['nf_potassium']
    let carbohydrates = nutrientInfo['nf_total_carbohydrate']
    let dietaryFiber = nutrientInfo['nf_dietary_fiber']
    let sugars = nutrientInfo['nf_sugars']
    let protein = nutrientInfo['nf_protein']

    //daily value calcs
    let totalFatDV = ((totalFat*100)/65).toFixed(0)
    let saturatedFatDV = ((saturatedFat*100)/20).toFixed(0)
    let cholesterolDV = ((cholesterol*100)/300).toFixed(0)
    let sodiumDV = ((sodium*100)/2400).toFixed(0)
    let potassiumDV = ((potassium*100)/3500).toFixed(0)
    let carbohydratesDV = ((carbohydrates*100)/300).toFixed(0)
    let dietaryFiberDV = ((dietaryFiber*100)/25).toFixed(0)
    let sugarsDV = ((sugars*100)/50).toFixed(0)
    let proteinDV = ((protein*100)/50).toFixed(0)

    for (let i = 0; i< fullNutrients.length; i++) {
        if (fullNutrients[i]['attr_id'] == 645) {
            monoUnsaturatedFat = fullNutrients[i]['value']
        } else if (fullNutrients[i]['attr_id'] == 646) {
            polyUnsaturatedFat = fullNutrients[i]['value']
        }
            
    }

    calories = parseFloat(calories).toFixed(0)
    totalFat = parseFloat(totalFat).toFixed(0)
    saturatedFat = parseFloat(saturatedFat).toFixed(0)
    polyUnsaturatedFat = parseFloat(polyUnsaturatedFat).toFixed(0)
    monoUnsaturatedFat = parseFloat(monoUnsaturatedFat).toFixed(0)
    cholesterol = parseFloat(cholesterol).toFixed(0)
    sodium = parseFloat(sodium).toFixed(0)
    potassium = parseFloat(potassium).toFixed(0)
    carbohydrates = parseFloat(carbohydrates).toFixed(0)
    dietaryFiber = parseFloat(dietaryFiber).toFixed(0)
    sugars = parseFloat(sugars).toFixed(0)
    protein = parseFloat(protein).toFixed(0)

    //Burn calcs
    let walkingBurnDuration = parseFloat((calories/223)*60).toFixed(0)
    let runningBurnDuration = parseFloat((calories/620)*60).toFixed(0)
    let cyclingBurnDuration = parseFloat((calories/440)*60).toFixed(0)
    
    let nutritionInfoWrapper = document.createElement('div')
    nutritionInfoWrapper.classList.add('nutrition-info-wrapper')
    
    nutritionInfoWrapperContent = `
    <div class="nutrition-info-wrapper">
    <div class="nutrition-info-header">
        <img src=${foodphoto} class="nutrition-info-img">
        <div class="nutrition-info-food-name">
            ${capitalizeFirstLetter(foodName)}
        </div>
    </div>
    <div class="nutrition-info-body">
        <div class="nutrition-facts-box">
            <div class="nutrition-facts-title">
                NUTRITION FACTS
            </div>
            <div class="nutrition-facts-food-name">
                ${foodName}
            </div>
            <div class="nutrition-facts-nutrients-box">
                <div class="amount-per-serving-row">
                    Amount per Serving
                </div>
                <div class="calories-row">
                    Calories
                    <div class="calories-value">
                        ${calories}
                    </div>
                </div>
                <div class="percent-daily-value-row">
                    % Daily Value
                </div>
                <div class="total-fat-row">
                    <div class="row-info-box">
                        Total Fat
                        <div class="total-fat-value">
                           ${totalFat}g
                        </div> 
                    </div>
                    <div class="total-fat-daily-value">
                        ${totalFatDV}%
                    </div>                                       
                </div>
                <div class="total-fat-subrows">
                    <div class="saturated-fat-row">
                        <div class="row-info-box">
                            Saturated Fat
                            <div class="saturated-fat-value">
                                ${saturatedFat}g
                            </div>
                        </div>
                        <div class="saturated-fat-daily-value">
                            ${saturatedFatDV}%
                        </div>
                    </div>
                    <div class="poly-fat-row">
                        <div class="row-info-box">
                                Polyunsaturated Fat 
                            <div class="poly-fat-value">
                                ${polyUnsaturatedFat}g
                            </div>
                        </div>                                       
                    </div>
                    <div class="mono-fat-row">
                        <div class="row-info-box">
                                monounsaturated Fat 
                            <div class="mono-fat-value">
                                ${monoUnsaturatedFat}g
                            </div>
                        </div>                                     
                    </div>
                </div>
                <div class="cholesterol-row">
                    <div class="row-info-box">
                            Cholesterol
                        <div class="cholesterol-value">
                            ${cholesterol}mg
                        </div>
                    </div>                                  
                    <div class="cholesterol-daily-value">
                        ${cholesterolDV}%
                    </div>
                </div>
                <div class="sodium-row">
                    <div class="row-info-box">
                            Sodium
                        <div class="sodium-value">
                            ${sodium}mg
                        </div>
                    </div>                                  
                    <div class="sodium-daily-value">
                        ${sodiumDV}%
                    </div>
                </div>
                <div class="potassium-row">
                    <div class="row-info-box">
                            Potassium
                        <div class="potassium-value">
                            ${potassium}mg
                        </div>
                    </div>                                   
                    <div class="potassium-daily-value">
                        ${potassiumDV}%
                    </div>
                </div>
                <div class="total-carbohydrates-row">
                    <div class="row-info-box">
                            Total Carbohydrates
                        <div class="total-carbohydrates-value">
                            ${carbohydrates}mg
                        </div>
                    </div>                                  
                    <div class="total-carbohydrates-daily-value">
                        ${carbohydratesDV}%
                    </div>
                </div>
                <div class="total-carbohydrates-subrow">
                    <div class="total-carbohydrates-subrows">
                        <div class="dietary-fiber-row">
                            <div class="row-info-box">
                                    Dietary Fiber
                                <div class="dietary-fiber-value">
                                    ${dietaryFiber}g
                                </div>
                            </div>                                              
                            <div class="dietary-fiber-daily-value">
                                ${dietaryFiberDV}%
                            </div>
                        </div>
                        <div class="sugars-row">
                            <div class="row-info-box">
                                    Sugars 
                                <div class="sugars-value">
                                    ${sugars}g
                                </div>
                            </div> 
                            <div class="sugars-daily-value">
                                ${sugarsDV}%
                            </div>                                       
                        </div>
                    </div>
                    <div class="protein-row">
                        <div class="row-info-box">
                                Protein 
                            <div class="protein-value">
                                ${protein}g
                            </div>
                        </div>
                        <div class="protein-daily-value">
                            ${proteinDV}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="nutrition-burn-kcal-flex-box">
            <div class="nutrition-burn-kcal-wrapper">

                <div class="burn-kcal-info-box">
                    <div class="burn-kcal-header">
                        How long would it take to burn 210 kCal
                    </div>
                    <div class="burn-kcal-info">
                        <div class="burn-info-row">
                            <div class="walking-burn-info">
                                Walking(3mph)
                            </div>
                            <div class="walking-burn-duration">
                                ${walkingBurnDuration} minutes
                            </div>
                        </div>
                        <div class="burn-info-row">
                            <div class="running-burn-info">
                                Running(6mph)
                            </div>
                            <div class="running-burn-duration">
                                ${runningBurnDuration} minutes
                            </div>
                        </div>
                        <div class="burn-info-row">
                            <div class="cycling-burn-info">
                                Cycling(10mph)
                            </div>
                            <div class="cycling-burn-duration">
                                ${cyclingBurnDuration} minutes
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`

    nutritionInfoWrapper.innerHTML = nutritionInfoWrapperContent
    searchResultsWrapper.append(nutritionInfoWrapper)
}

// Search button press function
function searchButtonClicked() {
    let searchBar = document.getElementsByClassName("search-bar")[0]

    if (searchBar.value == "") {
        console.log("No Entry found")
    } else {
        let rawData = fetchData(searchBar.value)
        extractData(rawData)
        searchFeedback(searchBar.value)
    }
    removeAllChildNodes(searchResultsWrapper)
    removeAllChildNodes(searchFeedbackBox)
    searchBar.value = ""
}

function enterButtonClicked(e) {
    e.preventDefault()
    let searchBar = document.getElementsByClassName("search-bar")[0]

    if (searchBar.value == "") {
        console.log("No Entry found")
    } else {
        if (e.keyCode == 13) {
            let rawData = fetchData(searchBar.value)
            extractData(rawData)
            removeAllChildNodes(searchResultsWrapper)
            removeAllChildNodes(searchFeedbackBox)
            searchFeedback(searchBar.value)
            searchBar.value = ""
        }

    }
}

function searchFeedback(context) {
    let feedback = document.createElement('div')
    feedback.classList.add('search-feedback')

    let feedbackContent = `Search results from "${context}"`
    feedback.innerHTML = feedbackContent
    searchFeedbackBox.append(feedback)
}


// Process functions

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}

function capitalizeFirstLetter(str) {
    const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
    return capitalized;
}


function ready() {
    const searchButton = document.getElementsByClassName("search-btn")[0]
    searchButton.addEventListener("click", searchButtonClicked)
    const searchBar = document.getElementsByClassName("search-bar")[0]
    searchBar.addEventListener("keyup", enterButtonClicked)
}