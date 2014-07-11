define(['jquery', 'appearanceUtils'], function($, utils) {
   return {
      // where
      selector: function(pull) {
         return pull.state == 'open';
      },
      // order by
      sort: function(pull) {
         return pull.created_at;
      },
      // Allows custom modifications of each pull's display
      adjust: function(pull, node) {
         // If the pull is over 30 days old...
         if (Date.now() - (new Date(pull.created_at)) > 2590000000 ) {
            // Mark it in red
            $(node).addClass('bg-warning');
         }
      },
      navbar: "#restore-buttons",
      // Functions to stick status information in indicators at the bottom of each pull
      indicators: {
         qa_remaining: function qa_remaining(pull, node) {
            var required = pull.status.qa_req;
            var completed = pull.status.QA.length;

            node.append('<p class="sig-count">QA ' + completed + '/' + required + '</p>');

            pull.status.QA.forEach(function(signature) {
               var avatar_url = 'https://avatars.githubusercontent.com/u/' + signature.data.user.id;
               node.append($('<img class="avatar">').attr('src', avatar_url));
            });
         },
         cr_remaining: function cr_remaining(pull, node) {
            var required = pull.status.cr_req;
            var completed = pull.status.CR.length;

            node.append('<p class="sig-count">CR ' + completed + '/' + required + '</p>');

            pull.status.CR.forEach(function(signature) {
               var avatar_url = 'https://avatars.githubusercontent.com/u/' + signature.data.user.id;
               node.append($('<img class="avatar">').attr('src', avatar_url));
            });
         },
         status: function status(pull, node) {
            var status = pull.status.commit_status;
            if (status) {
               var title = status.data.description;
               var url   = status.data.target_url;
               var state = status.data.state;
               node.append('<a target="_blank" title="' + title + '" href="' + url + '">' + state + "</a>");
            } else {
               node.text('No CI');
            }
         },
         user_icon: function user_icon(pull, node) {
            if (pull.is_mine()) {
               node.append('<span class="glyphicon glyphicon-user"></span>');
            }
         }
      },
      columns: [
         {
            title: "Special Pulls",
            id: "uniqPulls",
            selector: function(pull) {
               return (pull.deploy_blocked() || pull.status.ready) && !pull.dev_blocked();
            },
            sort: function(pull) {
               return pull.deploy_blocked() ? 0 : 1;
            },
            adjust: function(pull, node) {
               if (pull.deploy_blocked()) {
                  node.addClass('list-group-item-danger');
               }
            },
            triggers: {
               onCreate: function(blob, container) {
                  blob.removeClass('panel-default').addClass('panel-primary');
               },
               onUpdate: function(blob, container) {
                  utils.hideIfEmpty(container, blob, '.pull');
               }
            },
            shrinkToButton: true
         },
         {
            title: "dev_blocked Pulls",
            id: "blockPulls",
            selector: function(pull) {
               return pull.dev_blocked();
            }
         },
         {
            title: "CR Pulls",
            id: "crPulls",
            selector: function(pull) {
               return !pull.cr_done() && !pull.dev_blocked();
            },
            indicators: {
               cr_remaining: function(pull, node) {
                  var required = pull.status.cr_req;
                  var remaining = required - pull.status.CR.length;
               },
               qa_remaining: function(pull, node) {
                  var required = pull.status.qa_req;
                  var remaining = required - pull.status.QA.length;

                  if (remaining === 0) {
                     node.children('.sig-count').addClass('label label-success');
                  }
               }
            }
         },
         {
            title: "QA Pulls",
            id: "qaPulls",
            selector: function(pull) {
               var isHotfix = /^hotfix/.test(pull.head.ref);
               var numCRs = pull.status.CR.length;

               return !pull.qa_done() && !pull.dev_blocked() && (numCRs > 0 || isHotfix);
            },
            indicators: {
               qa_remaining: function(pull, node) {
                  var required = pull.status.qa_req;
                  var remaining = required - pull.status.QA.length;
               },
               cr_remaining: function(pull, node) {
                  var required = pull.status.cr_req;
                  var remaining = required - pull.status.CR.length;

                  if (remaining === 0) {
                     node.children('.sig-count').addClass('label label-success');
                  }
               }
            }

         }
      ]
   };
});
