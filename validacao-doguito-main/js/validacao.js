
/*const dataNascimento = document.querySelector('#nascimento');

dataNascimento.addEventListener('blur', (evento) => {
    validaDataNascimento(evento.target)// evento.target tá passando o elemento da tag que no caso é input com id nascimento.
})*/


export function valida(input){
    const tipoDeInput = input.dataset.tipo// Vai retornar o valor que o data-attribute tipo tem nele que no caso é dataNascimento.

    if(validadores[tipoDeInput]){
        validadores[tipoDeInput](input)
    }

    if(input.validity.valid){
        input.parentElement.classList.remove('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = '' // inserir na classe do input a mensagem passada, no caso é vazia.
    } else {
        input.parentElement.classList.add('input-container--invalido');
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro(tipoDeInput,input)
    }
}

//Listando o tipo de erros que temos
const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
]

//Mensagem de erro que queremos para cada erro
const mensagensDeErro = {
    nome:{
        valueMissing: 'O campo nome não pode estar vazio!'
    },
    email:{
        valueMissing: 'O campo email não pode estar vazio!',
        typeMismatch: 'O email digitado não é válido'
    },
    senha:{
        valueMissing: 'O campo senha não pode estar vazio!',
        patternMismatch: 'A senha digitada não é válida! Tamanho de 6-20 Caracteres, permitido: !@#$%^&*_=+-Name123'
    },
    dataNascimento:{
        valueMissing: 'O campo Data de nascimento não pode estar vazio!',
        customError: 'Usuário precisa ter idade maior que 18 para realizar o cadastro!'
    },
    cpf:{
        valueMissing: 'O campo CPF não pode estar vazio!',
        customError: 'O CPF digitado não é válido'
    },
    cep:{
        valueMissing: 'O campo CEP não pode estar vazio!',
        patternMismatch: 'O CEP digitado não é válido!',
        customError: 'CEP inválido! Por favor digite novamente.'
        
    },
    logradouro:{
        valueMissing: 'O campo logradouro não pode estar vazio!'
    },
    cidade:{
        valueMissing: 'O campo cidade não pode estar vazio!'
    },
    estado:{
        valueMissing: 'O campo estado não pode estar vazio!'
    },
    preco:{
        valueMissing: 'O campo preço não pode estar vazio!'
    }

}

const validadores = {
    dataNascimento: input => validaDataNascimento(input),
    cpf: input => validaCPF(input),
    cep: input => recuperarCEP(input)
}

//Essa função vai receber do meu dataset o input que estamos trabalhando e também  o valor de cada um se é nome, email ou os restantes, e dependendo de da div se é de nome ou as outras vamos observar como está o validity deles.
function mostraMensagemDeErro(tipoDeInput,input){
    let mensagem = ''
    tiposDeErro.forEach(erro => {
        if(input.validity[erro]){
            mensagem  = mensagensDeErro[tipoDeInput][erro]
        }
    })

    return mensagem
}

function validaDataNascimento(input){
    const dataRecebida = new Date(input.value);// Criando um objeto do tipo data

    let mensagem = ''

    if(!maiorQue18(dataRecebida)){
        mensagem = 'Usuário precisa ter idade maior que 18 para realizar o cadastro!'
    }

    input.setCustomValidity(mensagem)// validando o input e passndo a mendagem que quero exibir se for vdd.
}

function maiorQue18(data){
    const dataAtual = new Date();// Retorna a data do dia
    const dataMais18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate())// Convertendo a data do input para o tipo ano/mes/dia e somar o ano com 18 para poder comparar;
    return dataMais18 <= dataAtual
}

function validaCPF(input){
    //formatando o cpf, pegando o valor dele pelo input e trocando pelo formatado por meio do replace
    const cpfFormatado = input.value.replace(/\D/g, '')

    let mensagem = ''

    if(!checaCPFRepetido(cpfFormatado) || !checaEstruturaCPF(cpfFormatado)){
        mensagem = 'O CPF digitado não é válido';
    }

    input.setCustomValidity(mensagem)
}

function checaCPFRepetido(cpf){
    const valoresRepetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
    ]

    let cpfValido = true

    valoresRepetidos.forEach(valor => {
        if(valor == cpf){

            cpfValido = false;
        }
    })

    return cpfValido
}

function checaEstruturaCPF(cpf){
    const multiplicador = 10;

    return checaDigitoVerificador(cpf, multiplicador)
}

function checaDigitoVerificador(cpf,multiplicador){
    if(multiplicador >= 12){
        return true;
    }

    let multiplicadorInicial = multiplicador
    let soma = 0
    const cpfSemDigito = cpf.substr(0,multiplicador - 1).split('')
    const digitoVerificador = cpf.charAt(multiplicador-1)

    for(let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--){
        soma = soma + cpfSemDigito[contador] * multiplicadorInicial
        contador++
    }

    if(digitoVerificador == confirmaDigito(soma)){
        return checaDigitoVerificador(cpf, multiplicador+1);
    }

    return false
}

function confirmaDigito(soma){
    return 11 - (soma % 11)
}

function recuperarCEP(input){
    //formatar o cep para que ele aceite apenas numeros
    const cepFormatado = input.value.replace([/\D/g, '']);
    const url = `https://viacep.com.br/ws/${cepFormatado}/json/`
    const options = {
        method: 'GET',//é o tipo de requisição que será feita.
        mode: 'cors',//indica que a comunicação será feita entre aplicações diferentes.
        headers:{ //diz como que queremos receber as informações da API.
            'content-type': 'application/json;charset=utf-8'
        }
    }

    if(!input.validity.patternMismatch && !input.validity.valueMissing){
        fetch(url,options).then(
            response => response.json()
        ).then(
            data => {
                if(data.erro){
                    input.setCustomValidity('CEP inválido! Por favor digite novamente.')
                    return
                }
                input.setCustomValidity('')
                preencheCamposComCEP(data)
                return
            }
        )
    }

}

function preencheCamposComCEP(data){
    const logradouro = document.querySelector('[data-tipo="logradouro"]')
    const cidade = document.querySelector('[data-tipo="cidade"]')
    const estado = document.querySelector('[data-tipo="estado"]')

    logradouro.value = data.logradouro
    cidade.value = data.localidade
    estado.value = data.uf
}