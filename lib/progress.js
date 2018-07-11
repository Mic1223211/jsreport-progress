var requestProgress = {

};

var startTime = 0;

module.exports = (reporter,definition) =>{
  reporter.initializeListeners.add('request-progress',function() {

    reporter.beforeRenderListeners.insert(0,'request-progress',function(request,response){
      if(!request.options.isChildRequest) {
        request.options.parentId = request.id;
      }
      if(!request.options.isChildRequest){
        startTime = Date.now();
      }

      // keep track of request progress
      requestProgress[request.options.parentId||request.id] = request.progresses = requestProgress[request.options.parentId||request.id] || [];

      // do I need rewriters ?

      //push the progress to client
      if(reporter.options.express && reporter.options.express.socketIO){
        reporter.options.express.socketIO().emit('sendPdfToUser', { userId: 'xxxx-test-xxxx-xxxx', eventType: 'progress test', payload: {curTime:'11ms',progress:20}, consid: 'xxxx.xx.x.x.' });
      }

      request.progresses.push({
        timestamp:new Date(),
        timenow:Date.now(),
        isChildRequest:request.options.isChildRequest || false,
        costTime:Date.now() - startTime,
        progress:0,
        message:'Starting rendering request ' + request.id
      });

      //
    });

    reporter.afterRenderListeners.add('request-progress',function(request,response){
      request.progresses.push({
        timestamp:new Date(),
        timenow:Date.now(),
        isChildRequest:request.options.isChildRequest,
        costTime:Date.now() - startTime,
        progress:0,
        message:'Rendering request finished ' + request.id
      });

      response.progresses = request.progresses; // we may need it to store the progress info.


    });

    reporter.renderErrorListeners.add('request-progress',function(request,response,e){
      request.progresses.push({
        timestamp:new Date(),
        timenow:Date.now(),
        isChildRequest:request.options.isChildRequest,
        costTime:Date.now() - startTime,
        progress:0,
        message:'Rendering error  ' + request.id
      });
    });
    reporter.afterTemplatingEnginesExecutedListeners.add('request-progress',function(request,response){
      request.progresses.push({
        timestamp:new Date(),
        timenow:Date.now(),
        isChildRequest:request.options.isChildRequest,
        costTime:Date.now() - startTime,
        progress:0,
        message:'Tempating Engines Executed  ' + request.id
      });
    });


  });
}
