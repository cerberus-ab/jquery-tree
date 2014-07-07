    $(window).load(function() {
            // tree init
            $("#sce-tree").tree({
                toleaf: function(attr) {
                    console.info(attr);
                },
                tonew: function(attr) {
                    // do nothing
                }
            });
            // some tree
            var tree = [
            {
                'nid': 1,
                'name': 'Item1',
                'childs': [
                {
                    'nid': 11,
                    'name': 'Item11',
                    'childs': []
                },
                {
                    'nid': 12,
                    'name': 'Item12',
                    'childs': [
                    {
                        'nid': 121,
                        'name': 'Item121'
                    },
                    {
                        'nid': 122,
                        'name': 'Item122'
                    },
                    {
                        'nid': 121,
                        'name': 'Item123'
                    }
                    ]
                },
                {
                    'nid': 13,
                    'name': 'Item13',
                    'childs': [
                    {
                        'nid': 131,
                        'name': 'Item131',
                        'childs': [
                        {
                            'nid': 1311,
                            'name': 'Item1311'
                        }
                        ]
                    },
                    {
                        'nid': 132,
                        'name': 'Item132',
                        'childs': []
                    }
                    ]
                }
                ]
            }, {
                'nid': 2,
                'name': 'Item2',
                'data': {
                    'message': 'hello'
                }
            }
            ];
            // tree create
            $("#sce-tree").tree("create", tree);
    });
