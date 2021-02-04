import fs, { promises as fsPromises } from "fs";
import path from "path";

import Mustache from "mustache";

const RECIPE_DIR = path.join(__dirname, "..", "recipes");
const DOCS_DIR = path.join(__dirname, "..", "docs");
const TEMPLATE_DIR = path.join(__dirname, "..", "src", "templates");

const templates = {
    index: fs.readFileSync(path.join(TEMPLATE_DIR, "index.mustache")).toString(),
    cocktail: fs.readFileSync(path.join(TEMPLATE_DIR, "cocktail.mustache")).toString(),
};

const partials = {
    header: fs.readFileSync(path.join(TEMPLATE_DIR, "header.mustache")).toString(),
    footer: fs.readFileSync(path.join(TEMPLATE_DIR, "footer.mustache")).toString(),
};

const recipes: any = [];

(async () => {

    // Delete existing files
    fs.rmdirSync(DOCS_DIR, { recursive: true });
    fs.mkdirSync(DOCS_DIR);

    // Write recipes
    const files = await fsPromises.readdir(RECIPE_DIR);
    files.forEach((file) => {
        const recipe = JSON.parse(fs.readFileSync(path.join(RECIPE_DIR, file)).toString());
        recipe.filename = path.basename(file, ".json");
        const rendered = Mustache.render(templates.cocktail, recipe, partials);
        fs.writeFileSync(path.join(DOCS_DIR, `${recipe.filename}.html`), rendered);
        recipes.push(recipe);
    });

    recipes.sort((a: any, b: any) => {
        const A = a.name.toUpperCase();
        const B = b.name.toUpperCase();
        return (A < B) ? -1 : (A > B) ? 1 : 0;
    });

    // Write index
    const rendered = Mustache.render(templates.index, {
        name: "Home",
        recipes,
    }, partials);
    fs.writeFileSync(path.join(DOCS_DIR, `index.html`), rendered);

})();
