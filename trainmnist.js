var convnetjs = require('convnetjs');
var fs = require('fs');
var image_dimension = 28;
var valsetsize = 0.2;
var num_classes = 10;
var numepochs = 100;
var trainFilename = 'Path to Mnist Train file (in Kaggle Format)';
var testFilename = 'Path to Mnist Test file (in Kaggle Format)'
var dumpFilePath = 'models/net';
var epochlength = 10000;

var min = function(x, y) {
	return (x < y) ? x : y;
}
var layer_defs = [];
layer_defs.push({type:'input', out_sx:image_dimension, out_sy:image_dimension, out_depth:1});
layer_defs.push({type:'conv', sx:5, filters:8, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:3, stride:3});
layer_defs.push({type:'softmax', num_classes:num_classes});

var net = new convnetjs.Net();
net.makeLayers(layer_defs);

var trainer = new convnetjs.SGDTrainer(net, {method:'adadelta', batch_size:20, l2_decay:0.001});

console.log("Loading Data...");

var mnistTrainstr = fs.readFileSync(trainFilename).toString();
var mnistTrain = mnistTrainstr.split(/\r?\n/g).map(s => s.split(','));
mnistTrain.splice(0,1);
mnistTrain.splice(mnistTrain.length - 1, 1);


var trainLables = new Array(mnistTrain.length);

for(var i = 0; i < mnistTrain.length; ++i) {
	trainLables[i] = parseInt(mnistTrain[i][0]);
	var p = mnistTrain[i];
	mnistTrain[i] = new convnetjs.Vol(28,28,1);
	for(var xc=0;xc<image_dimension;xc++) {
	    for(var yc=0;yc<image_dimension;yc++) {
	        var ix = xc * image_dimension + yc + 1;
	        mnistTrain[i].set(yc,xc,1,p[ix]/255.0 - 0.5);
	    }
	}
}

var mnistValidation = mnistTrain.splice(0,mnistTrain.length*valsetsize);
var validationLabels = trainLables.splice(0,trainLables.length*valsetsize);

/////////  Uncomment this if You want to predict test data from Kaggle contest
/*
var mnistTeststr = fs.readFileSync(testFilename).toString();
var mnistTest = mnistTeststr.split(/\r?\n/g).map(s => s.split(','));
mnistTest.splice(0,1);
mnistTest.splice(mnistTest.length - 1, 1);
for(var i = 0; i < mnistTest.length; ++i) {
	var p = mnistTest[i];
	mnistTest[i] = new convnetjs.Vol(28,28,1);
    for(var xc=0;xc<image_dimension;xc++) {
	    for(var yc=0;yc<image_dimension;yc++) {
	        var ix = xc * image_dimension + yc;
	        mnistTest[i].set(yc,xc,1,p[ix]/255.0 - 0.5);
	    }
	}
//	console.log(i + "th done");
}

*/

console.log("Saving Trained Model...");

var json = net.toJSON();
var str = JSON.stringify(json);
fs.writeFileSync(dumpFilePath+'.json', str );
		
console.log("Training NeuralNet...");

var startindex = 0;
var endindex = min(mnistTrain.length,epochlength);

for(var e = 1; e <= numepochs; ++e) {
	for(var i = startindex; i < endindex ; ++i) {
		trainer.train(mnistTrain[i], trainLables[i]);
	}
	startindex = (endindex == mnistTrain.length) ? 0 : endindex;
	endindex = min(startindex + epochlength, mnistTrain.length);

	console.log("Calculating Accuracy on Known Data...");

	var rightanswers = 0;
	for(var i = 0; i < mnistValidation.length; ++i) {
		var probability_volume = net.forward(mnistValidation[i]).w;
		var prediction;
		var prob = 0;
		for(var j = 0; j < num_classes; ++j ) {
			if(probability_volume[j] > prob) {
				prob = probability_volume[j];
				prediction = j;
			}
		}
		rightanswers += (prediction == validationLabels[i] ) ? 1 : 0;
	}

	console.log("Accuracy after " + e + "th epoch is " + (rightanswers*100/(mnistValidation.length) ) + " %");
	
	if(e%10 == 0) {
		console.log("Saving Trained Model...");
		var json = net.toJSON();
		var str = JSON.stringify(json);
		var tmpname = dumpFilePath + e + 'e.json';
		fs.writeFileSync(tmpname, str );
	}

}


console.log("Loading From Json");
var str = fs.readFileSync('models/net100e.json').toString();
var json = JSON.parse(str); 
var net2 = new convnetjs.Net(); 
net2.fromJSON(json);

console.log("Calculating Accuracy on Known Data...");
var rightanswers = 0;
for(var i = 0; i < mnistValidation.length; ++i) {
	var probability_volume = net2.forward(mnistValidation[i]).w;
	var prediction;
	var prob = 0;
	for(var j = 0; j < num_classes; ++j ) {
		if(probability_volume[j] > prob) {
			prob = probability_volume[j];
			prediction = j;
		}
	}
	rightanswers += (prediction == validationLabels[i] ) ? 1 : 0;
}
console.log("Accuracy after of the loaded model is " + (rightanswers*100/(mnistValidation) ) + " %");

/////////  Uncomment this if You want to predict test data from Kaggle contest
/*
console.log('Predicting Unknown Data...');
var outputcsv = 'ImageId,Label\n';
for(var i = 0; i< mnistTest.length; ++i) {
	var probability_volume = net2.forward(mnistTest[i]).w;
	var prediction;
	var prob = 0;
	for(var j = 0; j < num_classes; ++j ) {
		if(probability_volume[j] > prob) {
			prob = probability_volume[j];
			prediction = j;
		}
	}
	outputcsv += (i+1);
	outputcsv += ',';
	outputcsv += (prediction);
	outputcsv += '\n';
}

fs.writeFileSync('Predictions.csv', outputcsv );
*/