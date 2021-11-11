var armazenarItem = [];
var armazenarMeta = [];
var armazenarInscricao = [];
var calculadora = 0;
var calculadoraInscricao = 0;


onload = function(){
    atualizarSectionDisplay();

    //Carregar os temas escolhido pelo usuário
    let a;
    try{
        a = localStorage.getItem("tema");
        if(a == null){
            throw "tema anterior não encontrado";
        }
    } catch(e){
        console.log("erro: " + e);
        a = "#121212";
    }
    mudarTema(a);
    if(a == "#121212"){
        let b;
        try{
            b = localStorage.getItem("corDoTema");
            if(b == null){
                throw "tema anterior não encontrado";
            }
        } catch(e){
            console.log("erro: " + e);
            b = "#ff5252";
        }
        root.style.setProperty("--corTema", b);
        root.style.setProperty("--corPath", b+"de");
    }
    

    //Mostrar a data atual na sideBar
    let data = gravarData();
    $("#hamburguer").children().eq(1).find("p").eq(1).text(data.dia)
    $("#hamburguer").children().eq(1).find("p").eq(2).text(`${data.diaNumerico} de ${data.mes}, ${data.ano}`)


     //Mostrar gastos e ganhos não apagados na sessão anterior
    try {
        armazenarItem = JSON.parse(localStorage.getItem("items"));
        if(armazenarItem == null){
            throw "local storage está vazio";
        }
    } catch(e){
        console.log("criando array, " + e)
        armazenarItem = [];
        localStorage.setItem("items", armazenarItem)
    }
    adicionarItensDoLocalStorage();
    console.table(armazenarItem);



     //Mostrar metas não apagados na sessão anterior
    try {
        armazenarMeta = JSON.parse(localStorage.getItem("metas"));
        if(armazenarMeta == null){
            throw "local storage está vazio";
        }
    } catch(e){
        console.log("criando array, " + e)
        armazenarMeta = [];
        localStorage.setItem("metas", armazenarMeta)
    }
    adicionarMetasDoLocalStorage();
    atualizarFuncionalidadeDosBotõesParaMeta();
    atualizarRemoverMeta();
    console.table(armazenarMeta);

     //Mostrar inscrições não apagados na sessão anterior
    try {
        armazenarInscricao = JSON.parse(localStorage.getItem("inscricoes"));
        if(armazenarInscricao == null){
            throw "local storage está vazio";
        }
    } catch(e){
        console.log("criando array, " + e)
        armazenarInscricao = [];
        localStorage.setItem("inscricoes", armazenarInscricao)
    }
    
    adicionarInscricoesDoLocalStorage();
    console.table(armazenarInscricao);
}

// adicionar inscrições quando inicia o app ---------------------------------------------------
function adicionarInscricoesDoLocalStorage(){
    if(armazenarInscricao.length > 0){
        armazenarInscricao.forEach(inscricao =>{

            calculadoraInscricao += inscricao.valor
            atualizarValorDoInscricoesHeader("atualizar", null);

            //adicionar inscrição na lista
            let lista = $("#listaAdicionarInscricoes");
            let items = lista.html();
            lista.html(items + inscricao.tag);
        })

        atualizarMainDisplay("mostrar inscricoes");
    } else{
        console.log("armazenarinscricao == vazio");
    }
    atualizarAnimacaoDoBtnRemoverEmInscricoes()
    atualizarRemoverInscricao();
}

// adicionar metas quando inicia o app ---------------------------------------------------
function adicionarMetasDoLocalStorage(){
    let metaIndex = -1;
    if(armazenarMeta.length > 0){
        atualizarMainDisplay("mostrar metas");
        armazenarMeta.forEach(meta =>{
            metaIndex++;

            //adicionar meta na lista principal
            let divAdicionarMetas = $("#divAdicionarMetas");
            let items = divAdicionarMetas.html();
            divAdicionarMetas.html(items + meta.tag);

            let metaValores = $("#divAdicionarMetas").children().last().find(".metaHeader").find(".metaItemValores").find(".metaItemRestante")
            let checagem = checarSeMetaEstaConcluida(metaIndex)
            if(checagem){
                metaValores.text("concluido");
            }else{
                metaValores.text(`Restante R$${meta.restante.toFixed(2)}`);
            }
            
            let porcentagem = calcularPorcentagem(meta.atual, meta.maximo) 

            let barraProgresso = $("#divAdicionarMetas").children().last().find(".progress").find(".progress-bar")
            barraProgresso.css('width', `${porcentagem}%`);
        })
    }
}
function checarSeMetaEstaConcluida(index){
    console.log(armazenarMeta[index].status)
    switch(armazenarMeta[index].status){
        case "andamento":
            return false;
        case "concluido":
            return true;
    }
}
// ---------------------------------------------------------------------------------------

// adicionar itens quando inicia o app ---------------------------------------------------
function adicionarItensDoLocalStorage(){
    if(armazenarItem.length > 0){
        let a = -1
        armazenarItem.forEach(item => {
            //checar a data para adicionar o item na lista do dia que ele foi criado
            a++
            console.log(`${item.data}, ${a}`)
            let checagem = checarData(item.data);
            

            //adicionar item na lista principal
            let lista = $("#lista");
            let items = lista.html();
            lista.html(items + item.tag);  
            
            switch(checagem){
                case "hoje":
                    //mostra o titulo "hoje" acima da lista
                    $(".dataDaLista").first().css("display", "block");
                    break;
                
                case "ontem":
                    adicionarNaListaDeOntem();
                    break;
                
                default:
                    adicionarNaListaDoDiaCerto(checagem);
            }

            atualizarMainDisplay("mostrar lista");
            //alterar o valor total exibido na tela pela classe e valor do item
            switch(item.classe){
                case "itemPerda":
                    calculadora -= Number(item.valor);
                    break;
                case "itemGanho":
                    calculadora+= Number(item.valor);
                    break;
                default:
                    window.alert("erro no pegarItemsDoLocalStorage");
                    break;
            }

            atualizarTotal()

            $(".lista").children().animate(
                {opacity: "1"}, 500
            )

        });

    } else{
        console.log("armazenaritem == vazio");
    }
}

function adicionarNaListaDeOntem(){
    divComAsListas = $(".lista").filter("#listaOntem");
    console.log(divComAsListas)
    console.log(divComAsListas.length)


    //switch analisa se existe uma lista com o valor do parâmetro
    switch(divComAsListas.length){

        case 0://cria uma nova lista para a data do item
            //criando o titulo da lista
            let novodia = document.createElement("h3")
            novodia.className = "dataDaLista";
            novodia.innerHTML="Ontem"
            //$("#sectionLista").append(novodia)
            $("#lista").after($(novodia))

            //criando a lista e adicionando o item
            let novaLista = $("<ul></ul>").html($("#lista").children().last());
            novaLista.attr("id", "listaOntem")
            novaLista.addClass("lista");

            //adicionando a nova lista na tela
            $("#sectionLista").append(novaLista);
            $(novodia).after($("#listaOntem"))
            console.log(novaLista);
            break;
        
        case 1://adiciona item na lista já existente
            let novoItem = $("#lista").children().last()
            $("#listaOntem").append(novoItem)
            break;

        default:
            window.alert("erro no adicionarnalistadeontemfunction")


    }

}

function adicionarNaListaDoDiaCerto(data){
    //Preparando o Id da lista (barras não podem ser usadas no id, então as troquei por "x")
    let dataParaId = data[0].replace(/[/]/g, "x");
    let novoId = `lista_${dataParaId}`

    //O filter procura se a lista já existe 
    divComAsListas = $(".lista").filter(`#${novoId}`);

    switch(divComAsListas.length){
        case 0://cria uma nova lista para a data do item
        
            //criando o titulo da lista
            let novodia = document.createElement("h3");
            novodia.className = "dataDaLista";
            if(data.length > 1){//adiciona a data numerica como titulo da lista
                novodia.innerHTML= data[1];
            } else {//se a lista tiver menos de 1 semana, o titulo da lista recebe o dia escrito por extenso
                novodia.innerHTML = data[0];
            }
            

            //criando a lista e adicionando o item
            let novaLista = $("<ul></ul>").html($("#lista").children().last());
            novaLista.attr("id", `${novoId}`)
            novaLista.addClass("lista");

            //adicionando a nova lista e o item na tela
            if($("#listaOntem").length == 1){  //se existir a lista de ontem, a nova lista é inserida depois dela
                $("#listaOntem").after(novaLista);
                $("#listaOntem").after(novodia);
            } else{  //caso não exista, é inserida depois da lista de hoje
                $("#lista").after(novaLista);
                $("#lista").after(novodia);
            }
            console.log(novaLista);
            break;
        
        case 1://adiciona item na lista já existente
            let novoItem = $("#lista").children().last()
            $(`#${novoId}`).append(novoItem)
            break;

        default:
            window.alert("erro no adicionarnalistadeontemfunction")
    }
}
// ------------------------------------------------------------------------------

function atualizarSectionDisplay(){
    if($("#inscricoes")[0].checked){
        $("#sectionInscricoes").css("display", "flex");
        $("#sectionLista").css("display", "none");
        $("#sectionMetas").css("display", "none");

        alterarOpcoesDaABaAdicionar("inscricoes display");
        $("#tituloAbaAdicionar").html("Nova Inscrição");

        $(".tipoApenasMeta").css("display", "none");
        $("#adicionar").html("adicionar inscrição");
    }
    if($("#listaCompleta")[0].checked){
        $("#sectionInscricoes").css("display", "none");
        $("#sectionLista").css("display", "flex");
        $("#sectionMetas").css("display", "none");

        alterarOpcoesDaABaAdicionar("lista principal display");
        $("#tituloAbaAdicionar").html("Novo Item");

        $(".tipoApenasMeta").css("display", "none");
        $("#adicionar").html("adicionar a lista");
    }
    if($("#metas")[0].checked){
        $("#sectionInscricoes").css("display", "none");
        $("#sectionLista").css("display", "none");
        $("#sectionMetas").css("display", "flex");

        alterarOpcoesDaABaAdicionar("metas display");
        $("#tituloAbaAdicionar").html("Nova Meta")

        $(".tipoApenasMeta").css("display", "block");
        $("#adicionar").html("adicionar meta");
    }
    zerarInputs();
}
$("input[name='option']").click(atualizarSectionDisplay);

function alterarOpcoesDaABaAdicionar(opcao){
    switch(opcao){
        case "inscricoes display":
            //Ocultar opção de contabilizar meta
            document.getElementById("divContabilizarEmMetas").style.display="none";

            //Ocultar a opção de gasto e ganho
            document.getElementById("escolherGastoGanho").style.display="none";

            //Ocultar o dropdown
            document.getElementById("dropdownItemClasse").style.display="none";
            break;
        case "lista principal display":
            //Mostrar opção de contabilizar meta
            document.getElementById("divContabilizarEmMetas").style.display="flex";

            //Mostrar a opção de gasto e ganho
            document.getElementById("escolherGastoGanho").style.display="flex";

            //Mostrar o dropdown
            document.getElementById("dropdownItemClasse").style.display="block";
            break;
        
        case "metas display":
            //Ocultar opção de contabilizar meta
            document.getElementById("divContabilizarEmMetas").style.display="none";

            //Mostrar a opção de gasto e ganho
            document.getElementById("escolherGastoGanho").style.display="flex";

            //Mostrar o dropdown
            document.getElementById("dropdownItemClasse").style.display="block";
            break;

        default:
            window.alert("erro no alterarOpcoesDaAbaAdicionar");

    }
}
function checarListaOuMeta(){
    if($("#inscricoes")[0].checked){
        prepararNovoItem("inscricao");
    }

    if($("#listaCompleta")[0].checked){
        prepararNovoItem("lista");
    }
    if($("#metas")[0].checked){
        prepararNovoItem("meta");
    }
}



// Datas  -----------------------------------------------------------------------
function checarData(data){
    //diaAtual pega a data de hoje e compara com a data do item sendo analisado
    let diaAtual = gravarData();

    //datas do item
    let itemAno = data.ano;
    let itemMes = data.mesNumerico;
    let itemDia = data.diaNumerico;
    let itemMinutos = data.minutos;

    if(diaAtual.ano == itemAno && diaAtual.mesNumerico == itemMes){
        switch(true){
            case (diaAtual.diaNumerico == itemDia):
                console.log("item criado hoje")
                return "hoje";
                break;

            case ( (diaAtual.diaNumerico - 1) == itemDia):
                console.log("item criado ontem");
                return "ontem"
                break;

            default:
                let d;
                console.log(` item criado em ${data.diaNumerico}/${data.mesNumerico}/${data.ano}`)

                if( (diaAtual.diaNumerico - 5) < data.diaNumerico ){// se o item faz menos de 5 dias que foi criado, retorna a data numerica, e data por extenso
                    d = [`${data.diaNumerico}/${data.mesNumerico}/${data.ano}`, data.dia];
                } else {
                    d = [`${data.diaNumerico}/${data.mesNumerico}/${data.ano}`];
                }
                return d;
        }
    } else {
        let d;
        d = [`${data.diaNumerico}/${data.mesNumerico}/${data.ano}`];
        return d;
    }
}

function gravarData(){
    const d = new Date();
    const dias = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"]
    const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
    let data = {
        dia: dias[d.getDay()],
        diaNumerico: d.getDate(),
        mes: meses[d.getMonth()],
        mesNumerico: d.getMonth() + 1,
        ano: d.getFullYear(),
        horas: d.getHours(),
        minutos: d.getMinutes(),
        segundos: d.getSeconds()
    }
    return data;
}
// ------------------------------------------------------------------------------


// aparecimento de Abas -----------------------------------------------------
//controlar o aparecimento da aba pra adicionar itens na lista ou alterar o valor total manualmente
var fecharBtn = document.getElementById("fechar");
var addBtn = document.getElementById("add");
function mudarAbaAdicionar(){
    //se a aba for fechada, o label gasto ganho deve voltar ao padrão para não bugar outrar funções
    if(this == fecharBtn){
         //O timeout ajuda a não bugar a animação para o usuário
         setTimeout(()=>{
            atualizarGastoGanho("gasto checked");
        }, 500);
    }

    let adc = document.getElementById("adicionar")
    if (this == fecharBtn || this == addBtn || this == adc){ 
        $("#divAdd")[0].classList.toggle("active");
        if(this == addBtn){
            $(".overlay").fadeIn(200)
            //checa se a aba inscrição esta selecionada, e se tiver foca no input de nome e esconde o dropdown 
            inscricaoConfig();
        } else {
        $(".overlay").fadeOut(200)
        }
    }
};
fecharBtn.addEventListener("click", mudarAbaAdicionar);
addBtn.addEventListener("click", mudarAbaAdicionar);
document.getElementById("adicionar").addEventListener("click", mudarAbaAdicionar);

function mudarAbaHamburguer(){
    let hamburgerBtn = document.getElementById("hamburguerBtn")
    let fecharHamburguerBtn = document.getElementById("fecharHamburguer");
    let home = document.getElementById("homeBtn");
    let modoNoturno = document.getElementById("modoNoturnoBtn");
    let sobreBtn = document.getElementById("sobreBtn");
    if(this == fecharHamburguerBtn || this == hamburgerBtn || this == home || this == modoNoturno || this == sobreBtn){
        $("#hamburguer")[0].classList.toggle("active");
        if(this == hamburgerBtn){
            $(".overlay").fadeIn(200)
        } else {
            $(".overlay").fadeOut(200)
        }
    }
}
document.getElementById("hamburguerBtn").addEventListener("click", mudarAbaHamburguer);
document.getElementById("fecharHamburguer").addEventListener("click", mudarAbaHamburguer);
document.getElementById("homeBtn").addEventListener("click", mudarAbaHamburguer);
document.getElementById("modoNoturnoBtn").addEventListener("click", mudarAbaHamburguer);
document.getElementById("sobreBtn").addEventListener("click", mudarAbaHamburguer);

function mudarAbaConfiguracoes(){
    $("#configuracoes")[0].classList.toggle("active");
    let configBtn = document.getElementById("configBtn");

    if(this == configBtn){
        $("#hamburguer")[0].classList.toggle("active");
        $(".overlay").fadeIn(200);
    } else{
        $(".overlay").fadeOut(200)
    }

}
document.getElementById("configBtn").addEventListener("click", mudarAbaConfiguracoes);
document.getElementById("fecharConfiguracao").addEventListener("click", mudarAbaConfiguracoes);

function mudarAbaPopup(comando){
    if(comando == "mostrar"){
        $("#popup").addClass("active");
        $(".overlay").fadeIn(200);
    } else{
        $("#popup")[0].classList.remove("active");
        $(".overlay").fadeOut(200);
    }
}
document.getElementById("popupBtnRemover").addEventListener("click", mudarAbaPopup);
document.getElementById("popupBtnCancelar").addEventListener("click", mudarAbaPopup);

function mudarAbaSobre(){
    $("#abaSobre")[0].classList.toggle("active");
    let sobreBtn = document.getElementById("sobreBtn");
    if(this == sobreBtn){
        $(".overlay").fadeIn(200);
    } else{
        $(".overlay").fadeOut(200)
    }
}
document.getElementById("sobreBtn").addEventListener("click", mudarAbaSobre);
document.getElementById("fecharAbaSobre").addEventListener("click", mudarAbaSobre);
// ------------------------------------------------------------------------------


// Pequenas funcionalidades  -----------------------------------------------------

//checa se a aba inscrição esta selecionada, e se tiver altera o foco para o input nome e esconde o dropdown 
function inscricaoConfig(){
    if($("#inscricoes")[0].checked){
        $("#dropdownItemClasse").css("display", "none");
        //O timeout ajuda a não bugar a animação da aba adicionar aparecendo na tela
        setTimeout(()=>{
            $("#itemNome").focus();
        }, 500)
    }
}
//ao apertar enter enquanto foca no input de nome ao adicionar item, o foco muda para o input de valor
$("#itemNome").keydown((event) =>{
    let x = event.keyCode;
    if(x == 13){
        $("#itemValor").focus();
    }
})

$("label[for='ganho']").click(()=>{
    $("#itemNome").focus();
})
$(".dropdown-item").click(()=>{
    $("#itemNome").focus();
})
// ------------------------------------------------------------------------------



// Funções para metas  ----------------------------------------------------------
function criarNovaMeta(nome, valor){
    //numeroFormatado deixa o valor de uma forma mais legível na tela
    let numeroFormatado = Number(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })

    valor = tratarValor(valor);

    let div;
    //retorna um objeto registrando a data que o item foi criado 
    let data = gravarData()
    let horaMinutoSegundo = `${data.horas}x${data.minutos}x${data.segundos}`

    //checa se o item é um gasto ou ganho
    let gasto = gastoAtivo();
    //pega o icone para adicionar no item (padrão, shopping, transporte etc...)
    let icone = escolherIconeParaItemTipo(itemTipo);

    let metaTipo;
    let metaIcone;
    let classeCor;

    if(gasto == true){
        metaTipo = "limite";
        classeCor = "danger";
    }
    if(gasto == false){
        metaTipo = "objetivo";
        classeCor = "success"
    }
    metaIcone = icone;

    //adicionando o html da meta dentro da div
    div = `<div class="metaItem" data-tipo="${metaTipo}" data-icone="${metaIcone}" data-dia="${data.dia}" data-mes="${data.mes}" data-diaNumerico="${data.diaNumerico}" data-mesNumerico="${data.mesNumerico}" data-ano="${data.ano}" data-hora="${horaMinutoSegundo}"><div class="metaHeader"><p class="metaItemTitulo">${nome} <i class="${icone}"></i></p><div class="metaItemValores"><p class="metaItemMeta text-${classeCor}">R$${numeroFormatado}</p><p class="metaItemRestante">Restante R$${valor}</p></div></div><div class="progress"><div class="progress-bar bg-${classeCor}" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div><div class="divMetaBotoes"><button class="editarMeta"><i class="fas fa-lock-open"></i></button><button class="removerMeta"><i class="fas fa-trash-alt"></i></button><div></div>`


    $("#divAdicionarMetas").append(div);

    criarNoLocalStorage("meta", nome, valor, metaTipo, data, icone, div)

    //resetando o tipo do item para os próximos registros
    itemTipo = "Padrão";
    $("#dropdownItemClasse").html(itemTipo)


    mudarAbaAdicionar();
    atualizarMainDisplay("mostrar metas")
    atualizarFuncionalidadeDosBotõesParaMeta();
    atualizarRemoverMeta();

}

function analisarMetasCompativeisComEsseItem(valor, icone){
    console.table(armazenarMeta)
    let metaIndex = -1;
    armazenarMeta.forEach(meta =>{
        metaIndex ++;
        if(meta.status == "andamento"){
            switch(meta.classe){
                case "objetivo":
                    if(meta.tipo == icone){
                        atualizarMeta(valor, metaIndex);
                        console.log(`${meta.nome} é um ganho e passou nos requisitos dentro do case ${meta.classe}`);
                    }
                    break;
                case "limite":
                    let todos = "fas fa-exclamation-triangle"
                    console.log(`---${meta.tipo}-------${icone}---`);
                    if(meta.tipo == icone || meta.tipo == todos){
                        console.log(`${meta.nome} passou nos requisitos como no case ${meta.classe}`)
                        atualizarMeta(valor, metaIndex);
                    }else{
                        console.log(`${meta.nome} NÃO passou nos requisitos da perda dentro do case ${meta.classe}`)
                    }
                    break;
                default:
                    window.alert("erro no analisar metas compativeis com esse item");
            }
        }
    })
}


function atualizarMeta(valor, index){
    //Preparar meta para mandar ao localStorage
    let metaObj = armazenarMeta[index];
    metaObj.atual += Number(valor);
    metaObj.restante -= Number(valor);
    console.log(metaObj)
    let porcentagem = calcularPorcentagem(metaObj.atual, metaObj.maximo)

    
    //atualizar meta na sessão atual
    $("#divAdicionarMetas").children().eq(index).find(".progress").find(".progress-bar").css("width", `${porcentagem}%`)

    if(metaObj.restante > 0){ //se for maior que 0, a meta deve estar em andamento e ser atualizada
        $("#divAdicionarMetas").children().eq(index).find(".metaHeader").find(".metaItemValores").find(".metaItemRestante").text(`Restante R$${metaObj.restante.toFixed(2)}`)
    } else { //se não for maior que 0, a meta deve ser configurada como concluida
        metaObj.status = "concluido"
        $("#divAdicionarMetas").children().eq(index).find(".metaHeader").find(".metaItemValores").find(".metaItemRestante").text("Concluido")

    }

    atualizarNoLocalStorage("meta");
}

//ao alterar o número de metas, os botões da meta para de funcionar em todos os itens, a função a seguir é usada para atualizar as animações sempre que for alterado o número de metas na lista
function atualizarFuncionalidadeDosBotõesParaMeta(){
    //Atualizando o botão remover
    $(".metaItem").mouseover(function (){
        $(this).children().eq(2).css("display", "flex");
    })
    
    $(".metaItem").mouseout(function(){
        $(this).children().eq(2).css("display", "none")
    })


    //Atualizando o botão pause
    $(".editarMeta").unbind("click"); //remover o click event primeiro para não bugar o botão, sendo acionado mais de uma vez por clique

    $(".editarMeta").click(function(){
        indexDaMetaSelecionada = $(this).parent().parent().index();
        metaSelecionada = $(this).parent().parent();

        switch($(this).html()){
            case `<i class="fas fa-lock-open"></i>`:
                $(this).html(`<i class="fas fa-lock"></i>`);
                alterarAndamentoDaMeta("pausado", metaSelecionada, indexDaMetaSelecionada);
                break;
            case `<i class="fas fa-lock"></i>`:
                $(this).html(`<i class="fas fa-lock-open"></i>`);
                alterarAndamentoDaMeta("andamento", metaSelecionada, indexDaMetaSelecionada);
                break;
            default:
                console.log("erro ao atualizar o botao pause/play das metas")
        }
    })
}

function alterarAndamentoDaMeta(tipo, item, index){
    armazenarMeta[index].status=tipo;
    console.table(armazenarMeta);
    switch(tipo){
        case "pausado":
            item.css("background-color", "var(--itemDesativado)");
            item.children().eq(0).children().eq(0).css("color", "gray");

            item.children().eq(0).children().eq(1).children().eq(0).css("color", "gray");
            item.children().eq(0).children().eq(1).children().eq(0).attr("class", "metaItemMeta");
            break;
        case "andamento":
            item.css("background-color", "var(--itemAtivado)");
            item.children().eq(0).children().eq(0).css("color", "var(--corLetra2)");

            item.children().eq(0).children().eq(1).children().eq(0).css("color", "var(--corLetra2)");
            if(armazenarMeta[index].classe == "limite"){
                item.children().eq(0).children().eq(1).children().eq(0).attr("class", "metaItemMeta text-danger");
            } else if(armazenarMeta[index].classe == "objetivo"){
                item.children().eq(0).children().eq(1).children().eq(0).attr("class", "metaItemMeta text-success");
            }
            break;
        default:
            console.log("arro no alterar andamento da meta");

            atualizarFuncionalidadeDosBotõesParaMeta();
    }
}

//pega o item correspondende a aba selecionada e manda pro localStorage
function atualizarNoLocalStorage(tipo, complemento){
    switch(tipo){
        case "meta":
            localStorage.setItem("metas", JSON.stringify(armazenarMeta));
            console.table(JSON.parse(localStorage.getItem("metas")));
            break;

        case "inscricoes":
            localStorage.setItem("inscricoes", JSON.stringify(armazenarInscricao))
            break;

        case "cor do tema":
            localStorage.setItem("corDoTema", complemento);
            break;

        default:
            window.alert("erro no atualizar no local storage");

    }

}

function calcularPorcentagem(valor, total){
    let resultado = (valor / total) * 100;
    return Math.floor(resultado)
}

function pausarOuContinuarMeta(){

}
// ----------------------------------------------------------------------------------

// Funções na criação de uma nova inscrição  ----------------------------------------
function criarNovaInscricao(nome, valor){
    //numeroFormatado deixa o valor de uma forma mais legível na tela
    let numeroFormatado = Number(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    valor = tratarValor(valor);

    let li = `<li class="liInscricoes"><div class="inscricoesConteudo"><h4>${nome}</h4><p>R$ ${numeroFormatado}/Mês <p></div><button class="removerInscricao"><i class="fas fa-trash-alt"></i></button></li>`

    //adicionando o item a lista
    let lista = $("#listaAdicionarInscricoes");
    let items = lista.html();
    lista.html(items + li);

    atualizarValorDoInscricoesHeader("somar", Number(valor));
    atualizarAnimacaoDoBtnRemoverEmInscricoes();
    criarNoLocalStorage("inscricao", nome, valor, null, null, null, li);
    atualizarMainDisplay("mostrar inscricoes");
    atualizarRemoverInscricao();
    

}
var inscricaoIndex;
var inscricaoItem;
function atualizarRemoverInscricao(){
    $(".removerInscricao").click(function (){
        inscricaoIndex = $(this).parent().index()
        inscricaoItem = $(this)
        mudarAbaPopup("mostrar");
    })
}
var indexDaMetaSelecionada;
var metaSelecionada;
function atualizarRemoverMeta(){
    $(".removerMeta").click(function (){
        indexDaMetaSelecionada = $(this).parent().parent().index();
        metaSelecionada = $(this).parent().parent();
        mudarAbaPopup("mostrar");
    })
}
document.getElementById("popupBtnRemover").addEventListener("click", confirmarRemocao);
function confirmarRemocao(){
    if($("#inscricoes")[0].checked){
        apagarItem("inscricao", inscricaoItem, inscricaoIndex);
    } else if($("#metas")[0].checked){
        apagarItem("meta", metaSelecionada, indexDaMetaSelecionada)
    } else{
        window.alert("erro no confirmar remoção")
    }
}
function apagarItem(tipo, item, index){
    switch(tipo){
        case "inscricao":
            pegarValorDoItemRemovido(index);

            armazenarInscricao.splice(index, 1);
            $(item).parent().remove();

            atualizarNoLocalStorage("inscricoes");

            atualizarAnimacaoDoBtnRemoverEmInscricoes();
            checarUltimoItem("inscricao");
            break;
        case "meta":
            armazenarMeta.splice(index, 1);
            $(item).remove();

            atualizarNoLocalStorage("meta");

            atualizarFuncionalidadeDosBotõesParaMeta();
            checarUltimoItem("meta");
            break;

        default:
            window.alert("erro no apagar item");
    }

    mostrarAlerta("alert-success", "Item Removido");

}


function pegarValorDoItemRemovido(index){
    let valor = armazenarInscricao[index].valor;
    atualizarValorDoInscricoesHeader("subtrair", valor);
}

function atualizarValorDoInscricoesHeader(tipo, valor){
    switch(tipo){
        case "somar":
            calculadoraInscricao += valor;
            break;
        case "subtrair":
            calculadoraInscricao -= valor;
            break;
    }
    
    $("#inscricoesHeader").children().eq(0).html(`<h3 class="my-0"><i class="fas fa-info-circle"></i> Você paga R$${calculadoraInscricao} por mês em inscrições</h3>`);
}


//ao alterar o número de inscrições, a animação do botão remover para de funcionar em todos os itens, a função a seguir é usada para atualizar as animações sempre que for alterado o número de inscrições na lista
function atualizarAnimacaoDoBtnRemoverEmInscricoes(){
    $(".liInscricoes").mouseover(function (){
        $(this).children().eq(1).show();
    })
    
    $(".liInscricoes").mouseout(function(){
        $(this).children().eq(1).hide()
    })
}

function checarUltimoItem(tipo){
    let items;
    switch(tipo){
        case "inscricao":
            items = $("#listaAdicionarInscricoes").children()
            if(items.length == 0){
                atualizarMainDisplay("mensagem e ilustracao para inscricao");
            }
            break;
        case "meta":
            items = $("#divAdicionarMetas").children()
            if(items.length == 0){
                atualizarMainDisplay("mensagem e ilustracao para meta");
            }
            break;
        default:
            window.alert("erro no checar ultimo item");
    }
}


// ----------------------------------------------------------------------------------

// Funções na criação de um item novo  ----------------------------------------------
function criarNovoItem(nome, valor){
    //numeroFormatado deixa o valor de uma forma mais legível na tela
    let numeroFormatado = Number(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    valor = tratarValor(valor);

    
    let li;
    //retorna um objeto registrando a data que o item foi criado 
    let data = gravarData()
    let horaMinutoSegundo = `${data.horas}x${data.minutos}x${data.segundos}`

    //checa se o item é um gasto ou ganho
    let gasto = gastoAtivo();

    //pega o icone para adicionar no item (padrão, shopping, transporte etc...)
    let icone = escolherIconeParaItemTipo(itemTipo);
    if(gasto == true){
        //adicionando o html do item dentro do li 
        li = `<li class="itemPerda" data-dia="${data.dia}" data-mes="${data.mes}" data-diaNumerico="${data.diaNumerico}" data-mesNumerico="${data.mesNumerico}" data-ano="${data.ano}" data-hora="${horaMinutoSegundo}"><div class="liInfo"><p class="nome">${nome}</p><p class="classe">${itemTipo}  <i class="${icone}"></i></p></div><p class="perda">- $ ${numeroFormatado}</p></li>`

        calculadora -= Number(valor);
        //armazena o item ao localStorage
        criarNoLocalStorage("lista", nome, valor, "itemPerda", data, itemTipo, li);
    } else {
        li = `<li class="itemGanho" data-dia="${data.dia}" data-mes="${data.mes}" data-diaNumerico="${data.diaNumerico}" data-mesNumerico="${data.mesNumerico}" data-ano="${data.ano}"><div class="liInfo"><p class="nome">${nome}</p><p class="classe">${itemTipo}  <i class="${icone}"></i></p></div><p class="lucro">$ ${numeroFormatado}</p></li>`

        calculadora += Number(valor);
        criarNoLocalStorage("lista", nome, valor, "itemGanho", data, itemTipo, li);
    }

    //mostra o titulo "hoje" acima da lista
    $(".dataDaLista").first().css("display", "block");

    //adicionando o item a lista
    let lista = $("#lista")
    let items = lista.html()
    lista.html(li + items)

    //animando e mostrando o item
    $("#lista").children().first().animate(
        {opacity: "1"}, 500
    )
    
    //Se o checkbox estiver selecionado, atualizar metas compativeis com o item recem criado
    let contabilizarItemEmMetas = document.getElementById("contabilizarEmMetas");
    if(contabilizarItemEmMetas.checked == true){
        analisarMetasCompativeisComEsseItem(valor, icone);
    }

    //resetando o tipo do item para os próximos registros
    itemTipo = "Padrão";
    $("#dropdownItemClasse").html(itemTipo)


    atualizarTotal();
    mudarAbaAdicionar();
    atualizarMainDisplay("mostrar lista");

}

function gastoAtivo(){
    let gasto = document.getElementById("gasto")
    if(gasto.checked == true){
        return true;
    }else{
        return false;
    }
}
//adicionar novo item na lista
function prepararNovoItem(section){
    let itemNome = document.getElementById("itemNome");
    let itemValor = document.getElementById("itemValor");

    switch(section){
        case "lista":
            if(itemNome.value.length < 1){
                itemNome.value = "item";
            }
            criarNovoItem(itemNome.value.trim(), itemValor.value);
            break;
        case "meta":
            if(itemNome.value.length < 1){
                itemNome.value = "meta";
            }
            criarNovaMeta(itemNome.value.trim(), itemValor.value);
            break;
        case "inscricao":
            if(itemNome.value.length < 1){
                itemNome.value = "Nova Inscrição";
            }
            criarNovaInscricao(itemNome.value.trim(), itemValor.value);
            break;
    }

    zerarInputs();
    mostrarAlerta("alert-success", "item adicionado");

    //O label gasto ganho deve voltar ao padrão para não bugar outrar funções
    atualizarGastoGanho("gasto checked");

}
document.getElementById("adicionar").addEventListener("click", checarListaOuMeta);

function zerarInputs(){
    //resetar os inputs depois de confirmar os valores
    $("#itemNome").val("");
    const valorPadrao = 1;
    $("#itemValor").val(valorPadrao.toFixed(2));
}

//Guarda as informações do item no localStorage
function criarNoLocalStorage(lugar, nome, valor, classe, data, tipo, tag){
    switch(lugar){
        case "inscricao":
            let inscricaoObj = {nome: nome, valor: Number(valor), tag: tag}
            armazenarInscricao.push(inscricaoObj);
            localStorage.setItem("inscricoes", JSON.stringify(armazenarInscricao));
            console.table(JSON.parse(localStorage.getItem("inscricoes")));
            break;
        case "lista":
            //Guardando o item
            let itemObj = {nome: nome, valor: valor, classe: classe, data: data, tipo: tipo, tag: tag}
            armazenarItem.push(itemObj);
            localStorage.setItem("items", JSON.stringify(armazenarItem));
            console.table(JSON.parse(localStorage.getItem("items")));

            //Guardando o valor da calculadora
            localStorage.setItem("total", calculadora);
            console.log(`%c O total exibido na tela deve ser: $${calculadora}`, 'color: green; font-size: 1.1em; font-weight: bold;');
            console.log("");
            break;
        case "meta":
            let metaObj = {nome: nome, maximo: Number(valor), atual: 0, restante: Number(valor), classe: classe, status: "andamento", data: data, tipo: tipo, tag: tag}
            armazenarMeta.push(metaObj);
            localStorage.setItem("metas", JSON.stringify(armazenarMeta));
            console.table(JSON.parse(localStorage.getItem("metas")));
    }
    
}


//Altera o total da tela
function atualizarTotal(){ 
    let valorTela = document.getElementById("valorTela");
    if(calculadora>=0) {
        valorTela.innerHTML="$"+Number(calculadora).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
    } else if(calculadora<0){
        valorTela.innerHTML="-$"+Number(calculadora).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).replace(/-/, "")
    }
}


function tratarValor(numero){
    //praparar o valor para juntar com o total
    numero = numero.toString();

    console.log(`%c valor sendo calculado: ${numero}`, 'color: blue; font-size: 1.1em;  font-weight: bold;')
    numero = numero.replace(/[-+]/g, "");
    return Number(numero).toFixed(2);
}
// ----------------------------------------------------------------------------------


//controlar o display das listas e mensagens com ilustrção ---------------------------
function atualizarMainDisplay(itensExibidos){
    let ilustracao = document.getElementsByClassName("ilustracao");
    let aviso = document.getElementsByClassName("aviso");
    let sortear;
    switch(itensExibidos){
        case "mensagem e ilustracao para inscricao":
            const avisoMsg3 = [
                "Adicione aqui seus gastos fixos mensais <br>  E tenha controle sobre seu dinheiro!",
                "Saiba para onde seu dinheiro está indo! <br>  Adicione todos seus gastos mensais aqui", 
                "Na dúvida se vai sobrar dinheiro final do mês? <br>  Registre seus gastos mensais aqui para não se esquecer deles!"
            ]
            //aviso[1].style.display="block";
            document.getElementById("sectionInscricoesVazia").style.display="block";
            document.getElementById("listaAdicionarInscricoes").style.display="none";
            document.getElementById("inscricoesHeader").style.display="none";
            sortear = Math.round(Math.random() * 2);
            aviso[0].innerHTML=avisoMsg3[sortear]
            
            sortear = Math.round(Math.random() * 4);
            ilustracao[0].src=`assets/desenho${sortear + 1}.png`;
            break;

        case "mensagem e ilustracao para lista":
            const avisoMsg = [
                "Não perca controle sobre suas finanças! <br>  Adicione algum gasto ou ganho para calcular",
                "Lista vazia :( <br>  Adicione algum gasto ou ganho para calcular", 
                "Na dúvida se vai sobrar dinheiro final do mês? <br>  Calcule aqui para ter certeza!"
            ]
            
            sortear = Math.round(Math.random() * 2);
            aviso[1].style.display="block";
            aviso[1].innerHTML=avisoMsg[sortear];
            
            ilustracao[1].style.display="block";
            sortear = Math.round(Math.random() * 4);
            ilustracao[1].src=`assets/desenho${sortear + 1}.png`;
            break;

        case "mensagem e ilustracao para meta":
            const avisoMsg2 = [
                "Não perca controle sobre suas finanças! <br>  Adicione alguma meta",
                "Chegue mais perto dos seus objetivos! <br>  Crie uma nova meta", 
                "Na dúvida se vai sobrar dinheiro final do mês? <br>  Crie uma meta de gastos para não estrapolar!"
            ]
            document.getElementById("sectionMetasVazia").style.display="block";
            document.getElementById("divAdicionarMetas").style.display="none";
            sortear = Math.round(Math.random() * 2);
            aviso[2].innerHTML=avisoMsg2[sortear]
            
            sortear = Math.round(Math.random() * 4);
            ilustracao[2].src=`assets/desenho${sortear + 1}.png`;
            break;


        case "mostrar lista":
            aviso[1].style.display="none";
            ilustracao[1].style.display="none";
            break;

        case "mostrar metas":
            document.getElementById("sectionMetasVazia").style.display="none";
            document.getElementById("divAdicionarMetas").style.display="block";
            break;

        case "mostrar inscricoes":
            document.getElementById("sectionInscricoesVazia").style.display="none";
            document.getElementById("listaAdicionarInscricoes").style.display="block";
            document.getElementById("inscricoesHeader").style.display="flex";
            break;

        default:
            window.alert("erro ao atualizar mainDisplay");
    }
}
// ------------------------------------------------------------------------------


// Estilo do app  ----------------------------------------------------------------

//variáveis para alterar o tema do app
let root = document.documentElement;
let temaBtn = document.getElementById("tema");
//identifica o tema atual
function pegarCor() {
    let checar = getComputedStyle(document.documentElement).getPropertyValue("--corFundo").trim();
    mudarTema(checar);
}
//alterna entre o tema claro e escuro
function mudarTema(checagem) {
    if(checagem == '#121212'){  //configurar tema principal
        root.style.setProperty("--corTema", '#ff5252');
        root.style.setProperty("--corPath", "#ff5252de");
        root.style.setProperty("--corFundo", '#ffffff');
        root.style.setProperty("--corFundo2", '#ffffff');
        root.style.setProperty("--corLetra", "black");
        root.style.setProperty("--corLetra2", "black");
        root.style.setProperty("--corApenasTemaClaro", "#d3d3d3");
        root.style.setProperty("--corApenasTemaEscuro", "#ffffff");
        root.style.setProperty("--itemDesativado", "#7272726b");
        root.style.setProperty("--itemAtivado", "#ffffff");
        root.style.setProperty("--corBackground", "#dddcdc");

        localStorage.setItem("tema", "#121212");
        mudarCorNavLink("nav-config-1")
        mostrarAlerta("alert-dark", "<i class='fas fa-moon'></i> Modo Noturno desligado")
    } else if(checagem == '#ffffff'){  //configurar tema escuro
        root.style.setProperty("--corTema", '#1e1e1e');
        root.style.setProperty("--corPath", "#333333");
        root.style.setProperty("--corFundo", '#121212');
        root.style.setProperty("--corFundo2", '#1e1e1e');
        root.style.setProperty("--corLetra", "gray");
        root.style.setProperty("--corLetra2", "#ffffff");
        root.style.setProperty("--corApenasTemaClaro", "1e1e1e");
        root.style.setProperty("--corApenasTemaEscuro", "gray");
        root.style.setProperty("--itemDesativado", "#121212");
        root.style.setProperty("--corBackground", "#5c5c5c");
        root.style.setProperty("--itemAtivado", "#313131");
        localStorage.setItem("tema", "#ffffff");
        mudarCorNavLink("nav-config-2");
        mostrarAlerta("alert-light","<i class='fas fa-moon'></i> Modo Noturno ligado");
    }
};
temaBtn.addEventListener("click", pegarCor);
document.getElementById("modoNoturnoBtn").addEventListener("click", pegarCor);
function mudarCorNavLink(classe){
    let n = document.getElementsByClassName("nav-link");
    n[0].className = `nav-link ${classe}`;
    n[1].className = `nav-link ${classe}`;
    n[2].className = `nav-link ${classe}`;
    n[3].className = `nav-link ${classe}`;
}
function mudarCorPrincipal(){
    let checarCorFundo = getComputedStyle(document.documentElement).getPropertyValue("--corFundo").trim();
    //se o tema do app for claro(Padrão), muda a cor do tema
    if(checarCorFundo == "#ffffff"){
        let c1 = $("label[for='c1']")[0];
        let c2 = $("label[for='c2']")[0];
        let c3 = $("label[for='c3']")[0];

        switch(true){
            case this == c1:
                root.style.setProperty("--corTema", '#7852ff');
                root.style.setProperty("--corPath", "#7852ffde");
                atualizarNoLocalStorage("cor do tema", "#7852ff");
                break;
            case this == c2:
                root.style.setProperty("--corTema", '#ff5252');
                root.style.setProperty("--corPath", "#ff5252de");
                atualizarNoLocalStorage("cor do tema", "#ff5252");
                break;
            case this == c3:
                root.style.setProperty("--corTema", '#39b939');
                root.style.setProperty("--corPath", "#39b939de");
                atualizarNoLocalStorage("cor do tema", "#39b939");
                break;
        }
        mostrarAlerta("alert-success", "Cor do tema alterado com sucesso")
    }else{
        document.getElementById("c2").checked = true;
        mostrarAlerta("alert-danger", "Desative o Modo Noturno para alterar o tema");
        
    }

    mudarAbaConfiguracoes();
    
}
$(".corLabelDiv").children().filter("label").click(mudarCorPrincipal);
function mostrarAlerta(alerta, mensagem){
    switch(alerta){
        case "alert-light":
            $(".alert-light").html(mensagem)
            $(".alert-light").animate({top: '5%'}, 'fast');
            setTimeout(() =>{
                $(".alert-light").animate({top: '-15%'}, 'fast');
            }, 2000)
            break;
        case "alert-dark":
            $(".alert-dark").html(mensagem)
            $(".alert-dark").animate({top: '5%'}, 'fast');
            setTimeout(() =>{
                $(".alert-dark").animate({top: '-15%'}, 'fast');
            }, 2000)
            break;
        case "alert-success":
            $(".alert-success").html(`<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg><div>${mensagem}</div>`)
            $(".alert-success").animate({top: '5%'}, 'fast');
            setTimeout(() =>{
                $(".alert-success").animate({top: '-15%'}, 'fast');
            }, 2000)
            break;
        case "alert-danger":
            $(".alert-danger").html(`<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg><div>${mensagem}</div>`);
            $(".alert-danger").animate({top: '5%'}, 'fast');
            setTimeout(() =>{
                $(".alert-danger").animate({top: '-15%'}, 'fast');
            }, 2000)
            break;


    }
}

//Alterar a cor do botão e do input valor dependendo da opção selecionada na aba adicionar itens
function atualizarGastoGanho(alterarEstadoManualmente){
    let gasto = document.getElementById("gasto");

    if(alterarEstadoManualmente == "gasto checked"){//se a função tiver o paramêtro selecionado, executar as configurações de acordo com ele
        gasto.checked = true;
        $("#dropdownItemClasse").css("display", "inline-block");
        $("#ganhoTitulo").css("display", "none");
        $("#itemValor").css({"color": "#ff5252"});
        $("#adicionar").css({"background-color": "#ff5252"});
    } else {//se não tiver paramêtro reconhecido, configurar de acordo com a seleção do input
        if(gasto.checked == true){
            $("#dropdownItemClasse").css("display", "inline-block");
            $("#ganhoTitulo").css("display", "none");
            $("#itemValor").css({"color": "#ff5252"});
            $("#adicionar").css({"background-color": "#ff5252"});
            
        } else {
            $("#dropdownItemClasse").css("display", "none");
            $("#ganhoTitulo").css("display", "flex");
            itemTipo = "Ganho";
            $("#itemValor").css({"color": "#49c545"});
            $("#adicionar").css({"background-color": "#49c545"});
        }
    }
    
}
$("#escolherGastoGanho").click(atualizarGastoGanho)
// ------------------------------------------------------------------------------


// Funções para os ícones dos itens  --------------------------------------------
var itemTipo = "Padrão";
function escolherIconeParaItemTipo(icone){
    switch(icone){
        case "Todas categorias":
            return "fas fa-exclamation-triangle"
        case "Padrão":
            return "fas fa-dollar-sign"
        case "Alimentação":
            return "fas fa-utensils"
        case "Transporte":
            return "fas fa-bus"
        case "Estudos":
            return "fas fa-graduation-cap"
        case "Roupas":
            return "fas fa-tshirt"
        case "Saúde":
            return "fas fa-heart"
        case "Shopping":
            return "fas fa-shopping-bag"
        case "Entretenimento":
            return "fas fa-gamepad"
        case "Supermercado":
            return "fas fa-shopping-basket"
        case "Ganho":
            return "fas fa-star"
        default:
            console.log(icone, "não reconhecido")
    }
}
function dropdownFeedback(){
    if(this == document.getElementById("gasto")){
        itemTipo = $("#dropdownItemClasse").html().trim();
    } else{
        $("#dropdownItemClasse").html(this.innerText);
        itemTipo = this.innerText.trim();
    }


}
$(".dropdown-menu").children().click(dropdownFeedback);
$("#gasto").click(dropdownFeedback)
// ------------------------------------------------------------------------------
