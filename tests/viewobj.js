test('viewObj packingEfficiency tests', function() {

    // reset. TODO port to use a fixture.
    reset();

    var mydata = {
        'name': 'Test Data for packingEfficiency',
        'aggregates': [
            {
                'name': 'Revenue',
                'periods': {
                    '2011-12': {
                        'value': 5
                    },
                },
                'metadata': {
                    'cssClass': 'revenue'
                },
                'items': [
                    {
                        'name': 'A',
                        'items': [
                            {
                                'name': 'Aa',
                                'periods': {
                                    '2011-12': {
                                        'value': 3
                                    }
                                }
                            }
                        ],
                        'periods': {
                            '2011-12': {
                                'value': 3
                            }
                        }
                    },
                    {
                        'name': 'B',
                        'items': [
                            {
                                'name': 'Ba',
                                'periods': {
                                    '2011-12': {
                                        'value': 1
                                    }
                                }
                            },
                            {
                                'name': 'Ba',
                                'periods': {
                                    '2011-12': {
                                        'value': 1
                                    }
                                }
                            }
                        ],
                        'periods': {
                            '2011-12': {
                                'value': 2
                            }
                        }
                    },
                ]
            }
        ]
    };
    

    var vo = new ViewObj(mydata, viewstate, [0, 0]);
    vo.period('2011-12');
    vo.render();

    ok(packingEfficiency(vo) == 1, 'Unexpanded DSR has efficiency 1');
    
    vo.popOut(0);
    ok(packingEfficiency(vo) == 1, 'Expanded DSR has efficiency 1');

    vo.children()[0].popOut(0);
    assertNearlyEqual(packingEfficiency(vo.children()[0]), 0.5, 0.00001,
                      'Packing efficiency of two identical items is 0.5');
    vo.popIn();
   

    window.packing = 'default';
    vo.popOut(0);
    vo.children()[1].popOut();
    assertNearlyEqual(packingEfficiency(vo.children()[1]), 
                      4 / ((Math.sqrt(2) + 2) * (Math.sqrt(2) + 2)), 0.00001,
                      'Packing efficiency of 2=1+1 in old packing model is ' +
                      '4 / (sqrt(2) + 2)^2');
    vo.popIn();
    

    window.packing = 'dendritic';
    vo.popOut(0);
    vo.children()[1].popOut();
    assertNearlyEqual(packingEfficiency(vo.children()[1]), 0.641412, 0.00001,
                      'Packing efficiency of 2=1+1 in new packing model is a ' +
                      'known constant: TODO rigorously verify.')


    vo.remove();

});