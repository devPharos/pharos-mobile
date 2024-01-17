import api from "./api";

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export async function getPageData(page, setLoading, setPaginas, setInputs, empresa, usuario, setSeparacoes) {
    setLoading(true)
    try {
        const { data } = await api.get(`${empresa.apiUrl}/${page}?Usuario=${usuario.usuario}`)
        if(['SeparacaoPV','SeparacaoOP','Picking'].includes(page)) {
            setSeparacoes(data)
            wait(100)
            setLoading(false)
            return
        }
        data.INPUTS.map((inp,index) => {
            if(index === data.INPUTS.length - 1) {
                setPaginas(inp.PAGINA);
            }
        })
        wait(100)
        setInputs(data.INPUTS);
        setLoading(false)
    } catch(err) {
        console.log('err', err)
        setLoading(false)
    }
}