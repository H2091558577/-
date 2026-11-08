package org.linlinjava.litemall;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 网页版客户端入口跳转
 *
 * <p>网页版（frontend/flower-web）打包后位于 classpath:/static/web/，
 * Spring Boot 的欢迎页只对根路径生效，因此这里把 /web 与 /web/ 跳转到 /web/index.html。
 *
 * <p>管理后台： http://localhost:8081/#/login
 * <br>网页版商城： http://localhost:8081/web/
 */
@Controller
public class WebPageController {

    @GetMapping({"/web", "/web/"})
    public String webIndex() {
        return "redirect:/web/index.html";
    }
}
