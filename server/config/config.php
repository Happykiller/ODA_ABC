<?php
$config = \Oda\SimpleObject\OdaConfig::getInstance();
$config->urlServer = "http://localhost/server/";
$config->resourcesPath = "resources/";

//for bd engine
$config->BD_ENGINE->base = 'abc';
$config->BD_ENGINE->user = 'abc';
$config->BD_ENGINE->mdp = 'pass';