<?php
require_once '../vendor/autoload.php';// Autoload our dependencies with Composer

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

$app = new \Slim\App();
$app->add(function(ServerRequestInterface $request, ResponseInterface $response, callable $next){
	$response = $response->withHeader('Content-type', 'application/json; charset=utf-8');
	$response = $response->withHeader('Access-Control-Allow-Origin', '*');
	$response = $response->withHeader('Access-Control-Allow-Methods', 'OPTION, GET, POST, PUT, PATCH, DELETE');
	return $next($request, $response);
});

//Chemins des fichiers JSON
$products_path = realpath('..').'/products.json';
$cart_path = realpath('..').'/cart.json';

//On charge les produits existants
$products = array();
if(file_exists($products_path)){
	$products = json_decode(file_get_contents($products_path), true);
}

$app->get('/products', function() use($products){
	echo json_encode($products);
});

$app->post('/products', function(Slim\Http\Request $request, Slim\Http\Response $response) use($products,$products_path){
    //$id =$request->getParam('id');
    $nom= $request->getParam('nom');
    $val = $request->getParam('val');
    $tag =$request->getParam('tag');
    //$tag = "" ? "Add tags" : $tag;

    if (!empty($nom) && !empty($val)){
        $products = array();
        if(file_exists($products_path)){
        		$products = json_decode(file_get_contents($products_path), true);
        	}
    }
    $id = sizeof($products)+1;
    $products[$id]['nom']=$nom;
    $products[$id]['description']=$tag;
    $products[$id]['prix']=$val;
    //var_dump($id,);
    $to_json = json_encode($products);
    file_put_contents($products_path, $to_json);
    echo "nom";
});

$app->post('/synchro', function(Slim\Http\Request $request, Slim\Http\Response $response) use($products,$products_path) {
    $products = array();
    $taskTab = $request->getParam('tasks');
   foreach ($taskTab as $task){

           $nom= $task["name"];
           $val = $task["duration"];
           $tag =$task["tags"];
           $id = sizeof($products)+1;

           //$tag = "" ? "Add tags" : $tag;

           $products[$id]['nom']=$nom;
           $products[$id]['description']=$tag;
           $products[$id]['prix']=$val;

     }
     $to_json = json_encode($products);
     file_put_contents($products_path, $to_json);

});

$app->run();
