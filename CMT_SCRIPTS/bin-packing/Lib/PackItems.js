/**
 * @file PackItems.js
 *
 * For Packing items into bins.
 *
 * @author m1b
 * @version 2025-07-24
 */

/**
 * Types of packing operations.
 * @enum {String}
 */
var PackingOperation = {
    /** a single packing with no pre-sorting */
    SINGLE_UNSORTED_PACKING: 'single_unsorted',
    /** a single packing after randomly shuffling blocks */
    SINGLE_RANDOM_PACKING: 'single_random',
    /** attempt a packing using each of the basic sorting functions, eg. 'sort by item area' */
    BASIC_SORTS_PACKING: 'basic_sorts',
    /** after attempting the basic sorts, make additional random shuffled attempts */
    BASIC_SORTS_PLUS_RANDOM_PACKING: 'basic_sorts_plus_random',
};

/**
 * Packs items in document.
 * @author m1b
 * @version 2025-07-24
 * @param {PackingOptions} options
 * @param {Document} options.doc - an Illustrator Document.
 * @param {Array<PageItem>} options.items - the items to pack.
 * @param {Number} [options.padding] - distance, in points, to leave between items (default: 0).
 * @param {Number} [options.margin] - distance, in points, to leave between bin edges and packed items (default: 0).
 * @param {Boolean} [options.doProgressivePacking] - whether to use progressivePacking (default: true).
 * @param {Boolean} [options.allow90DegreeRotation] - whether to allow rotation by 90° (default: false).
 * @param {Boolean} [options.allowArbitraryRotation] - whether to allow rotation by any amount to better fit into a rectangle (default: false).
 * @param {String} [options.bestFitBy] - can be 'count' or 'area' (default: 'count').
 * @param {Number} [options.maxAttemptCount] - the maximum number of attempts made (default: calculated).
 * @param {Boolean} [options.stopAtFirstSuccess] - whether to keep trying, even after all items are packed (default: false).
 * @param {Boolean} [options.showResults] - whether to show an alert message if any items couldn't be packed (default: false).
 * @param {Boolean} [options.keepRemainingItemsSelected] - whether to deselect items, and only keep unpacked items selected afterwards (default: false).
 * @param {Boolean} [options.doNotSort] - whether to disable sorting, so that each attempt is just a random shuffle (default: false).
 * @returns {PackingAttempt} - the best packing attempt.
 */
function packItems(options) {

    const MAX_PROGRESSIVE_SEARCH_STEP_COUNT = 10;

    var packingAdapter = options.packingAdapter;

    if (!packingAdapter)
        throw new Error('packItems: No packing adapter specified.');

    if (!options.doc)
        throw new Error('packItems: No `options.doc` supplied.');

    packingAdapter.init(options.doc);

    if (
        !options.items
        || 0 === options.items.length
    )
        return alert('No items to pack.');

    if (
        !options.bins
        || 0 === options.bins.length
    )
        return alert('No items to pack.');

    /* ------------------- *
     * SHOW UI             *
     * ------------------- */
    var result = options.showUI ? ui(options) : 1;

    if (2 === result)
        // user cancelled
        return;

    var doc = options.doc || app.activeDocument,
        items = options.items,
        bins = options.bins,
        padding = options.padding || 0,
        margin = options.margin || 0,
        orientation = options.packingOrientation || PackingOrientation.ROW_TOP_LEFT,
        allow90DegreeRotation = true === options.allow90DegreeRotation,
        maxProgressiveSearchStepCount = options.maxProgressiveSearchStepCount || MAX_PROGRESSIVE_SEARCH_STEP_COUNT;

    if (padding.constructor.name == 'String')
        padding = getUnitStringAsPoints(padding);

    if (margin.constructor.name == 'String')
        margin = getUnitStringAsPoints(margin);

    // apply the margin to the bins
    for (var i = 0; i < options.bins.length; i++)
        options.bins[i].setMetrics(margin, padding);

    var initializer;

    /* ------------------- *
     * ALLOW ANY ROTATION  *
     * ------------------- */
    if (options.allowAnyRotation)
        // function will rotate the item so that it fits into the smallest rectangle possible
        initializer = packingAdapter.rotateItemToFitSmallestRectangle;

    // blocks are objects representing an item for packing
    var unsortedBlocks = [];

    for (var i = 0; i < items.length; i++)
        unsortedBlocks.push(new Block(items[i], padding, packingAdapter, initializer));

    /* ------------------------------ *
     *  CREATE THE PACKING ATTEMPTS   *
     * ------------------------------ */

    // each attempt records a packing operation of `blocks` into `bins`.
    var attempts = [];

    if (
        options.doNotSort
        || PackingOperation.SINGLE_UNSORTED_PACKING === options.packingOperation
    ) {
        attempts.push(new PackingAttempt(unsortedBlocks, bins, 'Unsorted'));
    }

    else if (
        PackingOperation.BASIC_SORTS_PACKING === options.packingOperation
        || PackingOperation.BASIC_SORTS_PLUS_RANDOM_PACKING === options.packingOperation
    ) {
        attempts.push(new PackingAttempt(getFreshSortedBlocks(unsortedBlocks, Block.sortByAreaDescending), bins, 'Sort by area descending'));
        attempts.push(new PackingAttempt(getFreshSortedBlocks(unsortedBlocks, Block.sortByLargestDimension), bins, 'Sorted by largest side'));
        attempts.push(new PackingAttempt(getFreshSortedBlocks(unsortedBlocks, Block.sortByHeight), bins, 'sorted by height'));
        attempts.push(new PackingAttempt(getFreshSortedBlocks(unsortedBlocks, Block.sortByWidth), bins, 'sorted by width'));

        if (PackingOperation.BASIC_SORTS_PLUS_RANDOM_PACKING === options.packingOperation) {
            for (var i = 0, len = options.maxAttemptCount - attempts.length; i < len; i++)
                attempts.push(new PackingAttempt(shuffle(unsortedBlocks), bins, 'Random shuffle ' + i));
        }

    }

    else if (PackingOperation.SINGLE_RANDOM_PACKING === options.packingOperation)
        attempts.push(new PackingAttempt(shuffle(unsortedBlocks), bins, 'Random shuffle '));

    /* ---------------- *
     *  ATTEMPTS LOOP   *
     * ---------------- */
    attemptsLoop:
    for (var a = 0, bin, attempt, bin, packer, bestPacking, bestHeight = Infinity; a < attempts.length; a++) {

        attempt = attempts[a];
        attempt.index = a;

        // will keep track of the best packing
        bestPacking = null;

        binLoop:
        while (bin = attempt.nextBin()) {

            if (!bin)
                // no more bins available
                break binLoop;

            if (0 === attempt.remainingBlocks.length)
                // packing finished!
                break binLoop;

            // instantiate a packer, but we will override the height as needed
            var packer = new TrentiumsPacker(bin.width, bin.height, orientation, allow90DegreeRotation);

            // minimum height is the theoretical tightest packing
            var remainingBlocksHeight = getBlocksArea(attempt.remainingBlocks) / bin.width;

            // either the full bin height, or a more-compact, previous packings height
            var binHeight = bin.bestHeight || bin.height;

            // the progressive search will get this close to the best bin height
            var searchThreshold = Math.max(1.0, binHeight / 500);

            // $.writeln('***' + bin + '.bestHeight = ' + bin.bestHeight + '  searchThreshold = ' + searchThreshold);
            // $.writeln('remainingBlocksHeight = ' + remainingBlocksHeight);
            // $.writeln('binHeight = ' + binHeight);

            if (
                remainingBlocksHeight >= binHeight
                || !options.doProgressivePacking
            ) {

                /* ---------------------- *
                 *  Single Packing        *
                * ---------------------- */
                pack(binHeight);

            }

            else {

                /* ---------------------- *
                 *  Progressive Packing   *
                 * ---------------------- */
                progressivePacking(remainingBlocksHeight, binHeight, searchThreshold, maxProgressiveSearchStepCount);

            }

            // add the best packing to the attempt
            attempt.addPacking(bestPacking);

            if (
                bestPacking.bin.wasPackedWithNoRemainder
                && bestPacking.remainingBlocks.length > 0
            ) {
                // this attempt is already worse than a previous one, so don't bother
                // packing the next bin; jump straight to the next attempt
                continue attemptsLoop;
            }

            // store the best packing's height for this bin, so we can optimize the search next time
            if (0 === bestPacking.remainingBlocks.length) {
                bestPacking.bin.wasPackedWithNoRemainder = true;
                bestPacking.bin.bestHeight = bestPacking.height;
            }

            bestPacking = null;

        } // end bins loop

        if (
            options.stopAtFirstSuccess
            && 0 === attempt.remainingBlocks.length
        )
            // this attempt worked and we don't want to make any more
            break attemptsLoop;

    } // end attempts loop

    // get the best attempt
    var bestAttempt = PackingAttempt.getBestAttempt(attempts);

    /* ----------------------- *
     *  Position items using   *
     *  the best attempt.      *
     * ----------------------- */

    for (var i = 0, packing, block; i < bestAttempt.packings.length; i++) {

        packing = bestAttempt.packings[i];

        for (var j = 0; j < packing.packedBlocks.length; j++) {

            block = packing.packedBlocks[j];
            block.packingAdapter.positionItem(block, packing.bin, options);

        }

    }

    if (options.keepRemainingItemsSelected) {

        var selected = [];

        for (var i = 0; i < bestAttempt.remainingBlocks.length; i++)
            selected.push(bestAttempt.remainingBlocks[i].item);

        doc.selection = selected;

    }

    // cleanup / redraw
    options.packingAdapter.cleanup();

    if (options.showResults)
        showResults(options, bestAttempt, a);

    return bestAttempt;


    /**
     * Helper function to perform a packing operation on a bin with height `testHeight`.
     * Can be used on it's own to generate a `bestPackingResult`
     * or can be used as a BinarySearchRange `testFunction` to find the
     * smallest height that can fit all the blocks.
     * @param {Number} testHeight - the height of the "bin" (note: can be less than the actual bin.height).
     * @returns {Boolean} - true, when all blocks are packed sucessfully.
     */
    function pack(testHeight) {

        packer.reset(bin.width, testHeight);

        var blocksToPack = getFreshBlocks(attempt.remainingBlocks);

        var packing = new BinPacking(bin, packer.fit(blocksToPack, bin));
        packing.height = testHeight;
        packing.updateScore();

        if (
            !bestPacking
            || packing.score > bestPacking.score
        ) {
            bestPacking = packing;
            // $.writeln('bestPacking.remainingBlocks.length = ' + bestPacking.remainingBlocks.length);
        }

        return (0 === packing.remainingBlocks.length);

    };

    /**
     * Helper function that performs the progressive packing,
     * using a binary search between `remainingBlocksHeight`
     * and `binHeight`. Note: this executes the `pack` function
     * for each step in the search.
     */
    function progressivePacking(min, max, tolerance) {

        var searchResult;

        // make a new binary search between `minHeight` and `maxHeight`
        // to discover a height that allows a fairly compact packing
        var search = new BinarySearchRange(min, max, tolerance);

        while (search.searching()) {
            // calculate a packing at each step in the search
            searchResult = search.step(pack);
            // $.writeln("Step " + search.stepCounter + ": " + searchResult.guess.toFixed(0) + " → " + (searchResult.success ? "✅" : "❌"));
        }
        // $.writeln("Final approx: " + searchResult.guess.toFixed(0));

    };

};

/**
 * Returns a shuffled array of `things`.
 * Based on Fischer Yates algorithm.
 * @param {Array<*>} things - the things to shuffle.
 * @returns {Array<*>}
 */
function shuffle(things) {

    things = things.slice();

    if (!things)
        throw Error("shuffle: no `things` supplied.");

    var i = things.length,
        j = 0,
        temp;

    while (i--) {

        // swap randomly chosen element with current element
        j = Math.floor(Math.random() * (i + 1));
        temp = things[i];
        things[i] = things[j];
        things[j] = temp;

    }

    return things;

};

/**
 * Rounds `n` to `places` decimal places.
 * @param {Number} n - the number to round
 * @param {Number} places - number of decimal places, can be negative
 * @returns {Number}
 */
function round(n, places) {
    var m = Math.pow(10, places != undefined ? places : 3);
    return Math.round(n * m) / m;
};


/**
 * Shows results of bin packing.
 * @param {PackingOptions} options
 * @param {Attempt} attempt - the winning attempt.
 * @param {Number} attemptCount - the number of attempts made.
 * @returns {1|2} - result code
 */
function showResults(options, attempt, attemptCount) {

    var w = new Window("dialog", 'Pack Items Result', undefined, { closeButton: false }),

        resultGroup = w.add('group {orientation:"column", alignChildren: "fill", alignment: ["fill","fill"], margins: [15,15,15,15] }'),
        resultText = resultGroup.add('statictext { text:"", justify: "left", alignment:["fill","fill"], properties:{multiline:true} }'),

        buttonGroup = w.add('group {orientation:"row", alignment:["center","bottom"], alignChildren: ["right","bottom"], margins: [0,-5,0,0] }'),
        okButton = buttonGroup.add('button', undefined, 'Done', { name: 'ok' });

    resultText.preferredSize = [250, 230];

    var info = [
        (0 === attempt.remainingBlocks.length
            ? 'SUCCESS: Packed ' + (attempt.allBlocks.length - attempt.remainingBlocks.length) + ' blocks.'
            : 'FAILED: ' + attempt.remainingBlocks.length + ' blocks remaining.'
        ),
        '',
        'Attempt number: ' + (attempt.index + 1) + ' out of ' + attemptCount,
        'SortType: ' + (attempt.id || 'not sorted'),
        'Score: ' + (attempt.score * 100),
        ''
    ];

    info = info.concat(attempt.info);
    resultText.text = info.join('\n');

    if (options.windowLocation)
        w.location = options.windowLocation;
    else
        w.center();

    options.packingAdapter.cleanup();

    return w.show();

};

/**
 * Shows UI for Bin Packing
 * @param {PackingOptions} options - the packing options.
 * @returns {1|2} - result code
 */
function ui(options) {

    var w = new Window("dialog", 'Pack Items', undefined, { closeButton: false }),

        introGroup = w.add('group {orientation:"column", alignChildren: "fill", alignment: ["fill","top"], margins: [15,15,15,15] }'),
        introText = introGroup.add('statictext { text:"", justify: "center" }'),

        panelGroup = w.add('group {orientation:"row", alignChildren:["left","top"] }'),
        panel1 = panelGroup.add('panel'),
        panel2 = panelGroup.add('panel'),

        marginGroup = panel1.add("group {orientation:'column', alignment:['left','top'], alignChildren: ['left','top'], margins:[0,10,0,0], preferredSize: [120,-1] }"),
        marginLabel = marginGroup.add('statictext { text: "Margin:" }'),
        marginField = marginGroup.add('edittext {text: "", preferredSize: [120,-1] }'),

        paddingGroup = panel1.add("group {orientation:'column', alignment:['left','top'], alignChildren: ['left','top'], margins:[0,10,0,0], preferredSize: [120,-1] }"),
        paddingLabel = paddingGroup.add('statictext { text: "Space between items:" }'),
        paddingField = paddingGroup.add('edittext {text: "", preferredSize: [120,-1] }'),

        adapterExtras = panel1.add("group {orientation:'column', alignment:['left','top'], alignChildren: ['left','top'], margins:[0,10,0,0], preferredSize: [120,-1] }"),

        maxAttemptsGroup = panel2.add('group {orientation:"column", alignment:["left","top"], alignChildren: ["left","top"], margins:[0,10,0,0], preferredSize: [120,-1] }'),
        maxAttemptsLabel = maxAttemptsGroup.add('statictext { text:"Max attempts:" }'),
        maxAttemptsField = maxAttemptsGroup.add('edittext { text: "", preferredSize: [120,-1] }'),

        checkboxGroup = panel2.add('group {orientation:"column", alignment:["left","top"], alignChildren: ["left","top"], margins:[0,20,0,0], preferredSize: [120,-1] }'),
        allowRotationCheckbox = checkboxGroup.add("Checkbox { alignment:'left', text:'Allow 90\u00b0 rotation', margins:[0,10,0,0], value:false }"),
        allowAnyRotationCheckbox = checkboxGroup.add("Checkbox { alignment:'left', text:'Allow any rotation', margins:[0,10,0,0], value:false }"),
        stopAtFirstSuccessCheckbox = checkboxGroup.add("Checkbox { alignment:'left', text:'Stop at first success', margins:[0,10,0,0], value:false }"),
        doNotSortCheckbox = checkboxGroup.add("Checkbox { alignment:'left', text:'Do not sort', margins:[0,10,0,0], value:false }"),

        showResultsCheckbox = w.add("Checkbox { alignment:'left', text:'Show results summary', margins:[0,10,0,0], value:false }"),

        buttonGroup = w.add('group {orientation:"row", alignment:["center","bottom"], alignChildren: ["right","bottom"], margins: [0,-5,0,0] }'),
        cancelButton = buttonGroup.add('button', undefined, 'Cancel', { name: 'cancel' }),
        packButton = buttonGroup.add('button', undefined, 'Pack', { name: 'ok' });

    var items = options.items;

    if (undefined == options.margin)
        options.margin = '0 mm';

    if (undefined == options.padding)
        options.padding = '0 mm';

    if (undefined == options.maxAttemptCount)
        options.maxAttemptCount = 4;

    w.preferredSize.width = 250;

    if (!options.packingAdapter.ui)
        adapterExtras.visible = false;
    else
        options.packingAdapter.ui(adapterExtras);

    updateUI();

    packButton.onClick = function () {
        updateOptions();
        w.close(1);
    };

    if (options.windowLocation)
        w.location = options.windowLocation;
    else
        w.center();

    return w.show();

    /** update the UI controls, with values from options object */
    function updateUI() {

        introText.text = 'Trying to pack ' + options.items.length + ' items into ' + options.bins.length + ' bins.';
        marginField.text = String(options.margin);
        paddingField.text = String(options.padding);
        maxAttemptsField.text = String(options.maxAttemptCount);
        allowRotationCheckbox.value = options.allow90DegreeRotation;
        allowAnyRotationCheckbox.value = options.allowAnyRotation;
        stopAtFirstSuccessCheckbox.value = options.stopAtFirstSuccess;
        doNotSortCheckbox.value = options.doNotSort;
        showResultsCheckbox.value = options.showResults;

    };

    /** update the options object, with values from the UI */
    function updateOptions() {

        options.padding = paddingField.text;
        options.margin = marginField.text;
        options.maxAttemptCount = Number(maxAttemptsField.text);
        options.allow90DegreeRotation = allowRotationCheckbox.value;
        options.allowAnyRotation = allowAnyRotationCheckbox.value;
        options.stopAtFirstSuccess = stopAtFirstSuccessCheckbox.value;
        options.doNotSort = doNotSortCheckbox.value;
        options.showResults = showResultsCheckbox.value;

        options.marginPts = getUnitStringAsPoints(marginField.text) || 0;
        options.paddingPts = getUnitStringAsPoints(paddingField.text) || 0;

        if (isNaN(options.maxAttemptCount)) {
            options.maxAttemptCount = 4;
            maxAttemptsField.text = options.maxAttemptCount;
        }

    };

};

/**
 * Returns a PackingOptions object
 * complete with all default values;
 * @constructor
 * @author m1b
 * @version 2025-06-22
 * @param {Object} settings
 * @param {Document} settings.doc - a document.
 * @param {Array<PageItem>} settings.items - the items to pack.
 * @param {IllustratorPackingAdapter|IndesignPackingAdapter} settings.packingAdapter - the packing adapter.
 */
function PackingOptions(settings) {

    settings = settings || {};

    /** the items' document */
    this.doc = settings.doc || app.activeDocument;

    /** the page items to pack (can be groupItems) */
    this.items = settings.items || [];

    /** which packing adapter to use: Illustrator or Indesign */
    this.packingAdapter = settings.packingAdapter;

    if (!this.packingAdapter)
        throw new Error('PackingOptions: bad `packingAdapter` supplied.');

    /** whether to bypass the sorting system */
    this.doNotSort = settings.doNotSort || false;

    /** the space between items, in pts, or can use 'mm' or 'inch' */
    this.padding = settings.padding || 0;

    /** space around edges of artboards, in pts, or can use 'mm' or 'inch' */
    this.margin = settings.margin || 0;

    /** is it okay to rotate 90 degrees? (default: true) */
    this.allow90DegreeRotation = (false !== settings.allow90DegreeRotation);

    /**
     * Whether to allow rotation by any amount. If so, items will be first
     * rotated to fit best into a rectangle, and in practice this may cause
     * rotation between 0 and 90° (default: false).
     */
    this.allowAnyRotation = (true === settings.allowAnyRotation);

    /**
     * Progressive packing will generally give a more dense
     * rectangular packing _inside_ a bin, but will take longer
     * (default: true).
     */
    this.doProgressivePacking = (false !== settings.doProgressivePacking);

    /**
     * the maximum number of attempts at packing
     * - more attempts sometimes works better, but rarely.
     * - note that if `stopAtFirstSuccess` is on, and a solution is found,
     *   the script will stop before reaching `maxAttemptCount`.
     * - leave undefined to auto-calculate
     */
    this.maxAttemptCount = settings.maxAttemptCount;

    /** which packing operations to perform (default: the basic sorting plus random packings up until maxAttemptCount) */
    this.packingOperation = settings.packingOperation || PackingOperation.BASIC_SORTS_PLUS_RANDOM_PACKING;

    /** the orientation of the packing; will pack in rows, oriented to a corner */
    this.packingOrientation = settings.packingOrientation || PackingOrientation.ROW_TOP_LEFT;

    /**
     * should we stop on first successful packing, or keep trying to improve?
     * when this is on, the packing will always make `maxAttemptCount` attempts.
     */
    this.stopAtFirstSuccess = (false !== settings.stopAtFirstSuccess);

    /** shows the UI options (default: true) */
    this.showUI = (false !== settings.showUI);

    /** show results after packing (default: false) */
    this.showResults = (true === settings.showResults);

    /** only remaining items will be left selected (default: false) */
    this.keepRemainingItemsSelected = (true === settings.keepRemainingItemsSelected);

    /** the bins to pack */
    this.bins = settings.bins || [];

    /** debugging only - whether to show block bounds (default: false) */
    this.showBlockBounds = true === settings.showBlockBounds;

    /** debugging only - whether to actually move the items into the packing positions (default: true) */
    this.moveItems = false !== settings.moveItems;

    /** internal property - the padding, in points */
    this.paddingPts = settings.paddingPts;

    /** internal property - the margin, in points */
    this.marginPts = settings.marginPts;

    if (undefined == this.paddingPts)
        this.paddingPts = getUnitStringAsPoints(this.padding) || 0;

    if (undefined == this.marginPts)
        this.marginPts = getUnitStringAsPoints(this.margin) || 0;

};

/**
 * Returns a cleaned (deep-copied) and sorted array of `blocks`.
 * @param {Array<Block>} blocks - the blocks to sort.
 * @param {Function} sortFunction - the sorting function.
 * @returns {Array<items>}
 */
function getFreshSortedBlocks(blocks, sortFunction) {

    var cleanBlocks = getFreshBlocks(blocks);

    if (sortFunction)
        cleanBlocks.sort(sortFunction);

    return cleanBlocks;

};

/**
 * Returns a "freshened" array of `blocks`, each
 * keeping only the basic constructor parameters.
 * Uses cloning, so the output blocks are uncoupled
 * from the input blocks.
 * @param {Array<Block>} [blocks] - the blocks to sort (only necessary the first time).
 * @returns {Array<Block>}
 */
function getFreshBlocks(blocks) {

    var cleanBlocks = [];

    for (var i = 0; i < blocks.length; i++)
        cleanBlocks[i] = blocks[i].clone();

    return cleanBlocks;

};