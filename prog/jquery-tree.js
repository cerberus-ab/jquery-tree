(function($) {

    var Tree = {
        methods: {},
        priv: {}
    }

    // Приватные методы ========================================================

    /**
     * Вывод сообщения об ошибке
     * @param [string] msg - текст сообщения
     */
    Tree.priv.console = {
        error: function(msg) {
            console.error("Tree: " + msg);
        }
    }

    /**
     * Получить атрибуты узла
     * @this   [dom] ссылается на узел
     * @return [object] атрибуты узла
     */
    Tree.priv.get = function() {
        var data = $(this).data("node-data");
        return {
            nid: $(this).attr("data-nid"),
            name: $(this).find("> .tree-head:first").text(),
            data: data ? data : null
        }
    }

    /**
     * Добавить новый узел
     * @this   [dom] ссылается на дерево
     * @param  [dom] body - тело целевого узла
     * @param  [object] attr - атрибуты узла
     * @return [dom] новый узел
     */
    Tree.priv.add = function(body, attr) {
        // атрибуты узла по умолчанию
        attr = $.extend(true, {
            // id узла
            nid: null,
            // название узла
            name: "Item",
            // является открытым
            isopen: false,
            // является конечным
            isleaf: false,
            // является корневым
            isroot: false,
            // данные узла
            data: null
        }, attr);
        // инкремент счетчика узлов
        var count = $(this).data("tree").count += 1;
        // проверка id нового узла на null
        if (attr.nid === null) {
            attr.nid = "g" + count;
        }
        // формирование заголовка
        var append = "<li class='tree-node" + (attr.isroot ? " isroot" : "")
            + (attr.isleaf ? " isleaf" : " isempty") + "' data-nid='" + attr.nid + "'>";
        // формирование тела
        append += "<div class='tree-img'></div><div class='tree-head'>" + attr.name + "</div>"
            + (!attr.isleaf ? "<ul class='tree-body'></ul>" : "") + "</li>";
        // добавление
        var node = $(append).appendTo(body);
        // сохранение данных для узла
        if (attr.data !== null) {
            $(node).data("node-data", attr.data);
        }
        // получить родительский узел
        var parent = $(node).parent().parent();
        // если новый узел не корневой, то указать родительский как имеющий содержимое
        if (!attr.isroot && $(parent).hasClass("isempty")) {
            $(parent).removeClass("isempty");
        }
        // если определена функция при добавлении нового узла
        var tonew = $(this).data("tree").tonew;
        if (typeof tonew === "function") {
            tonew.call(node, Tree.priv.get.call(node));
        }
        // вернуть новый узел
        return node;
    }

    /**
     * Удалить указанный узел
     * @this   [dom] ссылается на дерево
     * @param  [dom] node - указанный узел
     * @return [boolean] удалось или нет
     */
    Tree.priv.remove = function(node) {
        // получить родительский узел
        var parent = $(node).parent().parent(),
            isroot = $(node).hasClass("isroot");
        // удалить узел
        $(node).remove();
        // если родитель больше не имеет прямых потомков,
        // то указать его как не имеющий содержимое
        if (!isroot && !$(parent).find("> .tree-body > .tree-node").length) {
            $(parent).removeClass("isopen").addClass("isempty");
        }
        // вернуть результат
        return true;
    }

    /**
     * Построение дерева по объекту
     * @this   [dom] ссылается на дерево
     * @param  [dom] body - тело целевого узла
     * @param  [array] list - список вложенных узлов
     * @param  [string] pid - id родительского узла
     */
    Tree.priv.pass = function(body, list, pid) {
        var self = this;
        // определить является ли набор корневым
        var isroot = (pid === null);
        // для каждого узла из списка
        list.forEach(function(entry){
            // определить является ли узел конечным
            var isleaf = !(entry.childs instanceof Array);
            // добавить новый узел
            var node = Tree.priv.add.call(self, body, $.extend(true, entry ,{
                isroot: isroot,
                isleaf: isleaf
            }));
            // если узел не конечный, то обойти его потомков
            if (!isleaf) {
                Tree.priv.pass.call(self, $(node).find("> .tree-body:first"), entry.childs, entry.nid);
            }
        });
    }


    // Публичные методы ========================================================

    /**
     * Инициализация дерева
     * @param  [object] options - настройки инициализации
     * @return [dom] измененные объекты
     */
    Tree.methods.init = function(options) {
        // настройки
        options = $.extend(true, {
            /**
             * Функцмя при выборе конечного узла
             * @this   [dom] ссылается на узел
             * @param  [object] - атрибуты узла через get
             */
            toleaf: function(attr) {
                // do nothing
            },
            /**
             * Функцмя при выборе добавлении нового узла
             * @this   [dom] ссылается на новый узел
             * @param  [object] - атрибуты узла через get
             */
            tonew: function(attr) {
                // do nothing
            }
        }, options);

        // выполнить и вернуть
        return this.each(function() {
            // получить атрибуты дерева
            var data = $(this).data("tree");
            // если дерево еще не было определено
            if (!data) {
                // Event: открытие/закрытие узлов
                $(this).delegate("div.tree-img", "click", function() {
                    // получить узел
                    var node = $(this).parent();
                    // если узел является листом, то вернуться
                    if ($(node).hasClass("isleaf") || $(node).hasClass("isempty")) return;
                    // поменять класс
                    $(node).toggleClass("isopen");
                });
                // Event: выбор узла дерева
                $(this).delegate("div.tree-head", "click", function() {
                    // получить узел
                    var node = $(this).parent();
                    // если узел конечный
                    if ($(node).hasClass("isleaf")) {
                        // вызвать функцию
                        if (typeof options.toleaf === "function") {
                            options.toleaf.call(node, Tree.priv.get.call(node));
                        }
                    }
                });
            }
            // определить атрибуты дерева
            $(this).data("tree", {
                "count": 0,
                "tonew": options.tonew,
                "toleaf": options.toleaf
            });
            // начальная инициализация
            $(this).empty().append("<ul class='tree-body'></ul>");
        });
    }

    /**
     * Создать дерево по объектному представлению
     * @param  [object] struct - представление дерева
     * @return [dom] измененные объекты
     */
    Tree.methods.create = function(struct) {
        // для каждого дерева из набора
        return this.each(function() {
            // начальная инициализация
            $(this).empty().append("<ul class='tree-body'></ul>");
            // если дерево описано
            Tree.priv.pass.call(this, $(this).find("> .tree-body:first"), struct, null);
        });
    }

    /**
     * Разрушить дерево
     */
    Tree.methods.destroy = function() {
        return this.each(function() {
            $(this).find("> .tree-body").remove();
            $(this).removeData("tree");
        });
    }

    /**
     * Получить данные узла
     * @param  [string] nid - id целевого узла
     * @return [object] данные об узле
     */
    Tree.methods.get = function(nid) {
        // если целевой узел не найден, то ошибка
        var node = $(this).find(".tree-node[data-nid='" + nid + "']").eq(0);
        if (!node.length) {
            throw "Node #" + nid + " not exists!";
        }
        // иначе продолжить
        return Tree.priv.get.call(node);
    }

    /**
     * Добавить новый узел
     * @param  [object] attr - атрибуты нового узла
     * @param  [string] pid - id родителя (null, если корневой)
     * @return [dom] новый узел
     */
    Tree.methods.add = function(attr, pid) {
        // атрибуты узла по умолчанию
        attr = $.extend(true, {
            // id узла
            nid: null,
            // название узла
            name: "Item",
            // является конечным
            isleaf: false,
            // данные узла
            data: null
        }, attr);
        // по умолчанию узел корневой
        pid = pid || null;

        // если такой узел уже существует, то ошибка
        if (attr.nid !== null && $(this).find(".tree-node[data-nid='" + attr.nid + "']").length) {
            throw "Node #" + attr.nid + " is already exists!";
        }
        // если родительский узел не найден, то ошибка
        var node = (pid !== null ? $(this).find(".tree-node[data-nid='" + pid + "']").eq(0) : $(this));
        if (!node.length) {
            throw "Parent node #" + pid + " not exists!";
        }
        // если родительский узел является конечным, то ошибка
        var body = $(node).find("> .tree-body:first");
        if (!body.length) {
            throw "Parent node #" + pid + " is a leaf!";
        }
        // иначе продолжить
        return Tree.priv.add.call(this, body, $.extend(true, attr, {
            isroot: (pid === null)
        }));
    }

    /**
     * Удалить указанный узел
     * @param  [string] nid - id целевого узла
     * @return [boolean] удалось или нет
     */
    Tree.methods.remove = function(nid) {
        // если целевой узел не найден, то ошибка
        var node = $(this).find(".tree-node[data-nid='" + nid + "']").eq(0);
        if (!node.length) {
            throw "Node #" + nid + " not exists!";
        }
        // иначе продолжить
        return Tree.priv.remove.call(this, node);
    }


    // Контроллер ==============================================================

    $.fn.tree = function(method) {
        try {
            if (Tree.methods[method]) {
                if (method !== "init" && !$(this).data("tree")) {
                    throw "This object not defined as a tree!";
                }
                return Tree.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === "object" || !method) {
                return Tree.methods.init.apply(this, arguments);
            } else {
                // do nothing
            }
        } catch (e) {
            Tree.priv.console.error(e);
        }
    };

})(jQuery);
