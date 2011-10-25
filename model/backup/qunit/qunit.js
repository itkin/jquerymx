steal('funcunit/qunit')
 .then("jquery/model/backup").then(function(){
 	
	
module("jquery/model/backup",{
	setup : function(){
		$.Model.extend("Recipe")
	}
})

test("backing up", function(){
	var recipe = new Recipe({name: "cheese"});
	ok(!recipe.isDirty(), "not backedup, but clean")

	recipe.backup();
	ok(!recipe.isDirty(), "backedup, but clean");

	recipe.name = 'blah'

	ok(recipe.isDirty(), "dirty");

	recipe.restore();

	ok(!recipe.isDirty(), "restored, clean");

	equals(recipe.name, "cheese" ,"name back");

});

test("backup / restore with associations", function(){
	$.Model("Instruction");
	$.Model("Cookbook");

	$.Model("Recipe",{
		attributes : {
			instructions : "Instruction.models",
			cookbook: "Cookbook.model"
		}
	},{});




	var recipe = new Recipe({
		name: "cheese burger",
		instructions : [
			{
				description: "heat meat"
			},
			{
				description: "add cheese"
			}
		],
		cookbook: {
			title : "Justin's Grillin Times"
		}
	});

	//test basic is dirty

	ok(!recipe.isDirty(), "not backedup, but clean")

	recipe.backup();
	ok(!recipe.isDirty(), "backedup, but clean");

	recipe.name = 'blah'

	ok(recipe.isDirty(), "dirty");

	recipe.restore();

	ok(!recipe.isDirty(), "restored, clean");

	equals(recipe.name, "cheese burger" ,"name back");

	// test belongs too

	ok(!recipe.cookbook.isDirty(), "cookbook not backedup, but clean");

	recipe.cookbook.backup();

	recipe.cookbook.attr("title","Brian's Burgers");

	ok(!recipe.isDirty(), "recipe itself is clean");

	ok(recipe.isDirty(true), "recipe is dirty if checking associations");

	recipe.cookbook.restore()

	ok(!recipe.isDirty(true), "recipe is now clean with checking associations");

	equals(recipe.cookbook.title, "Justin's Grillin Times" ,"cookbook title back");

	//try belongs to recursive restore

	recipe.cookbook.attr("title","Brian's Burgers");
	recipe.restore();
	ok(recipe.isDirty(true), "recipe is dirty if checking associations, after a restore");

	recipe.restore(true);
	ok(!recipe.isDirty(true), "cleaned all of recipe and its associations");


})

test('makeParams only save changed attributes and associations', function(){
  $.Model('User',{
    attributes: {
      name: 'string',
      category: 'Category.model',
      loans: 'Loan.models'
    }
  },{})
  $.Model('Category',{},{})
  $.Model('Loan',{},{})

  u = new User({name: 'test', category: {name: 'category 1'}, loans:[{id:2, name: 'test'}]})
  data = u.makeParams()
  equals(data['name'], 'test', "attributes")
  equals(data['category']['name'], 'category 1', "single association")
  equals(data['loans'][0]["name"], 'test', 'plural association')

  u = new User({id: 1, name: 'test', category: {id:2, name: 'category 1'}, loans:[{id:2, name: 'test'}]})
  data = u.makeParams()
  delete data["id"]
  ok($.isEmptyObject(data), 'nothing should change since its not a new object')

  u.category.attr('name', 'cat name has changed')
  data = u.makeParams()
  equals(data['name'], undefined)
  equals(data['category']['name'], 'cat name has changed')
  equals(data['category']['id'], 2)
  equals(data['loans'], undefined)

  u.attr('loans',[{id:2, name: 'test'},{name: 'added loan'}])
  data = u.makeParams()
  equals(data['loans'].length, 2)
})




})
 